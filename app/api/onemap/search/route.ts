import { NextResponse } from "next/server";

type OneMapResult = {
  SEARCHVAL?: string;
  ADDRESS?: string;
  POSTAL?: string;
  LATITUDE?: string;
  LONGITUDE?: string;
};

type OneMapSearchResponse = {
  results?: OneMapResult[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const token = process.env.ONEMAP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing ONEMAP_ACCESS_TOKEN on server" },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL("https://www.onemap.gov.sg/api/common/elastic/search");
  upstreamUrl.searchParams.set("searchVal", q);
  upstreamUrl.searchParams.set("returnGeom", "Y");
  upstreamUrl.searchParams.set("getAddrDetails", "Y");
  upstreamUrl.searchParams.set("pageNum", "1");
  upstreamUrl.searchParams.set("token", token);

  const response = await fetch(upstreamUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `OneMap search failed (${response.status})` },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as OneMapSearchResponse;
  const first = payload.results?.[0];
  if (!first?.LATITUDE || !first?.LONGITUDE) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({
    lat: Number(first.LATITUDE),
    lng: Number(first.LONGITUDE),
    address: first.ADDRESS ?? first.SEARCHVAL ?? q,
    postalCode: first.POSTAL ?? ""
  });
}
