/**
 * Downloads official CSVs from data.gov.sg (open API) and SG Schooling ballot HTML.
 * Run from project root: npm run data:download
 *
 * Optional: set DATA_GOV_SG_API_KEY in env for higher rate limits (see data.gov.sg guide).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const rawDir = path.join(root, "data/raw");

const DATASETS = [
  { id: "d_688b934f82c1059ed0a6993d2a829089", file: "general-information-of-schools.csv" },
  { id: "d_9aba12b5527843afb0b2e8e4ed6ac6bd", file: "cca.csv" },
  { id: "d_f1d144e423570c9d84dbc5102c2e664d", file: "subjects.csv" },
  { id: "d_db1faeea02c646fa3abccfa5aba99214", file: "distinctive.csv" }
];

const BALLOT_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadDataset(datasetId, destPath) {
  const key = process.env.DATA_GOV_SG_API_KEY;
  const headers = {
    "User-Agent": "p1-school-selector-data-script/1.0"
  };
  if (key) headers["x-api-key"] = key;

  const initUrl = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/initiate-download`;
  const res = await fetch(initUrl, { headers });
  const json = await res.json();
  if (!res.ok || json.code !== 0 || !json.data?.url) {
    throw new Error(`initiate-download failed for ${datasetId}: ${JSON.stringify(json)}`);
  }
  const csvRes = await fetch(json.data.url);
  if (!csvRes.ok) throw new Error(`CSV fetch failed ${csvRes.status}`);
  fs.writeFileSync(destPath, Buffer.from(await csvRes.arrayBuffer()));
}

async function main() {
  fs.mkdirSync(rawDir, { recursive: true });

  for (let i = 0; i < DATASETS.length; i++) {
    const { id, file } = DATASETS[i];
    const dest = path.join(rawDir, file);
    if (i > 0) await sleep(11000);
    console.log("Downloading", file, "…");
    await downloadDataset(id, dest);
    console.log("  wrote", dest, fs.statSync(dest).size, "bytes");
  }

  for (const year of BALLOT_YEARS) {
    console.log(`Fetching SG Schooling ballot page (${year}) …`);
    const htmlRes = await fetch(`https://sgschooling.com/year/${year}/all`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; p1-school-selector/1.0)" },
      redirect: "follow"
    });
    if (!htmlRes.ok) throw new Error(`SG Schooling HTTP ${htmlRes.status} for year ${year}`);
    const htmlPath = path.join(rawDir, `sgschooling-${year}-all.html`);
    fs.writeFileSync(htmlPath, Buffer.from(await htmlRes.arrayBuffer()));
    console.log("  wrote", htmlPath, fs.statSync(htmlPath).size, "bytes");
    await sleep(700);
  }
  console.log("Done. Run: npm run data:build");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
