/**
 * Enriches `lib/schools-bundled.json` with school latitude/longitude using OneMap search.
 *
 * Usage:
 *   node --env-file=.env.local scripts/geocode-school-coordinates.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const filePath = path.join(root, "lib/schools-bundled.json");

const token = process.env.ONEMAP_ACCESS_TOKEN;
if (!token) {
  console.error("Missing ONEMAP_ACCESS_TOKEN in environment.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeWithOneMap(query) {
  const url = new URL("https://www.onemap.gov.sg/api/common/elastic/search");
  url.searchParams.set("searchVal", query);
  url.searchParams.set("returnGeom", "Y");
  url.searchParams.set("getAddrDetails", "Y");
  url.searchParams.set("pageNum", "1");
  url.searchParams.set("token", token);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const first = payload?.results?.[0];
  if (!first?.LATITUDE || !first?.LONGITUDE) return null;
  return {
    lat: Number(first.LATITUDE),
    lng: Number(first.LONGITUDE)
  };
}

async function main() {
  const schools = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < schools.length; i++) {
    const school = schools[i];
    if (school.lat !== null && school.lng !== null) continue;

    const postalQuery = school.postalCode ? String(school.postalCode) : "";
    let coords = null;

    if (postalQuery) {
      coords = await geocodeWithOneMap(postalQuery);
    }

    if (!coords) {
      coords = await geocodeWithOneMap(`${school.name} ${school.address}`);
    }

    if (coords) {
      school.lat = coords.lat;
      school.lng = coords.lng;
      updated += 1;
    } else {
      failed += 1;
      school.lat = null;
      school.lng = null;
    }

    if ((i + 1) % 20 === 0) {
      console.log(`Processed ${i + 1}/${schools.length}…`);
    }
    await sleep(220);
  }

  fs.writeFileSync(filePath, JSON.stringify(schools), "utf8");
  console.log(`Done. Updated ${updated} schools; failed ${failed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
