/**
 * Builds lib/schools-bundled.json from:
 * - data.gov.sg CSVs in data/raw/ (downloaded via npm run data:download)
 * - SG Schooling P1 ballot HTML in data/raw/sgschooling-2025-all.html (from npm run data:download)
 *
 * Third-party ballot source: https://sgschooling.com/year/2025/all
 * Official school profiles: data.gov.sg MOE datasets (see lib/source-catalog.ts)
 */

import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      q = !q;
      continue;
    }
    if (c === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseCsvLine(lines[i]);
    const row = {};
    header.forEach((h, j) => {
      row[h] = cells[j] ?? "";
    });
    rows.push(row);
  }
  return { header, rows };
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/['`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Ballot slug on sgschooling.com → unique substring of official MOE `school_name` */
const SLUG_NAME_HINT = {
  "chij-toa-payoh": "CHIJ PRIMARY (TOA PAYOH)",
  "st-andrew-junior": "ST ANDREW'S SCHOOL (JUNIOR)",
  "st-anthony-canossian": "ST. ANTHONY'S CANOSSIAN PRIMARY",
  "st-anthony": "ST. ANTHONY'S PRIMARY",
  "st-gabriel": "ST. GABRIEL'S PRIMARY",
  "st-hilda": "ST. HILDA'S PRIMARY",
  "st-joseph-institution-junior": "ST. JOSEPH'S INSTITUTION JUNIOR",
  "st-margaret": "ST. MARGARET'S SCHOOL (PRIMARY)",
  "st-stephen": "ST. STEPHEN'S SCHOOL"
};

function schoolSlugVariantsFromOfficialName(schoolName) {
  const full = slugify(schoolName.replace(/\(/g, " ").replace(/\)/g, " "));
  const v = new Set([full]);
  v.add(full.replace(/-primary-school$/g, ""));
  v.add(full.replace(/-school$/g, ""));
  v.add(full.replace(/-primary$/g, ""));
  v.add(full.replace(/-school-/g, "-"));
  return [...v];
}

function parseNumCell(html) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\u00a0/g, " ").trim();
  if (!text || text === "-") return null;
  const m = text.match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

function pressureFromRatio(applicants, vacancies) {
  if (vacancies == null || vacancies <= 0 || applicants == null) return "Moderate";
  const r = applicants / vacancies;
  if (r >= 1.5) return "High";
  if (r >= 1.0) return "Moderate";
  return "Low";
}

function parsePhaseRow($, tr, kind) {
  const cells = $(tr).find("td");
  if (cells.length < 7) return null;
  const label = $(cells[0]).text().trim();
  if (kind === "vacancy" && !label.includes("Vacancy")) return null;
  if (kind === "applied" && !label.includes("Applied")) return null;
  if (kind === "taken" && !label.includes("Taken")) return null;
  const labels = ["Phase 1", "2A", "2B", "2C", "2C(S)", "3"];
  const phases = {};
  labels.forEach((phase, i) => {
    const v = parseNumCell($(cells[i + 1]).html() || "");
    phases[phase] = { [kind]: v };
  });
  return phases;
}

function mergePhaseData(target, patch) {
  if (!patch) return;
  for (const [ph, cell] of Object.entries(patch)) {
    if (!target[ph]) target[ph] = {};
    Object.assign(target[ph], cell);
  }
}

function parseBallotHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const $ = cheerio.load(html);
  const trs = $("table tbody tr").toArray();
  const out = [];

  for (let i = 0; i < trs.length; i++) {
    const tr = trs[i];
    const tds = $(tr).find("td");
    if (tds.length < 7) continue;
    const first = $(tds[0]);
    const link = first.find("a[href^='/school/']");
    if (!link.length) continue;
    const href = link.attr("href") || "";
    const m = href.match(/^\/school\/([^/]+)/);
    if (!m) continue;
    const slug = m[1];
    const name = link.find("strong").text().trim() || link.text().trim();
    const phases = {};
    const rVac = parsePhaseRow($, trs[i + 1], "vacancy");
    const rApp = parsePhaseRow($, trs[i + 2], "applied");
    const rTaken = parsePhaseRow($, trs[i + 3], "taken");
    mergePhaseData(phases, rVac);
    mergePhaseData(phases, rApp);
    mergePhaseData(phases, rTaken);
    out.push({ slug, displayName: name, phases });
    i += 3;
  }
  return out;
}

function findPrimaryRows(generalCsvPath) {
  const raw = fs.readFileSync(generalCsvPath, "utf8");
  const { rows } = parseCsv(raw);
  return rows.filter((r) => {
    const ml = (r.mainlevel_code || "").toUpperCase();
    return ml.includes("PRIMARY") || ml.includes("P1");
  });
}

function normName(s) {
  return s.replace(/\./g, "").replace(/\s+/g, " ").trim().toUpperCase();
}

function matchCsvRow(ballotSlug, primaryRows) {
  const hint = SLUG_NAME_HINT[ballotSlug];
  if (hint) {
    const h = normName(hint);
    const found = primaryRows.filter((r) => normName(r.school_name).includes(h));
    if (found.length === 1) return found[0];
    const exact = primaryRows.find((r) => normName(r.school_name) === h);
    if (exact) return exact;
  }
  for (const r of primaryRows) {
    const vars = schoolSlugVariantsFromOfficialName(r.school_name);
    if (vars.includes(ballotSlug)) return r;
  }
  for (const r of primaryRows) {
    const vars = schoolSlugVariantsFromOfficialName(r.school_name);
    for (const v of vars) {
      if (v.startsWith(ballotSlug + "-") || ballotSlug.startsWith(v + "-")) return r;
    }
  }
  return null;
}

function indexBySchoolName(rows, key) {
  const map = new Map();
  for (const r of rows) {
    const name = (r[key] || r.school_name || r.School_name || r.School_Name || "")
      .trim()
      .toUpperCase();
    if (!name) continue;
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(r);
  }
  return map;
}

function findDistinctiveRows(officialSchoolName, mainlevelCode, distinctiveRows) {
  const upper = normName(officialSchoolName);
  const ml = normName(mainlevelCode || "");
  const officialIsPrimary =
    upper.includes("PRIMARY") || ml.includes("PRIMARY") || ml.includes("P1");
  const hits = distinctiveRows.filter((r) => {
    const d = normName(r.school_name || "");
    if (!d) return false;
    if (officialIsPrimary && !d.includes("PRIMARY")) return false;
    return (
      upper.startsWith(d) ||
      d.startsWith(upper.replace(/ PRIMARY SCHOOL$| SCHOOL$/i, "").trim())
    );
  });
  return hits;
}

function main() {
  const generalPath = path.join(root, "data/raw/general-information-of-schools.csv");
  const ccaPath = path.join(root, "data/raw/cca.csv");
  const subjectsPath = path.join(root, "data/raw/subjects.csv");
  const distinctivePath = path.join(root, "data/raw/distinctive.csv");
  const ballotPath = path.join(root, "data/raw/sgschooling-2025-all.html");
  const outPath = path.join(root, "lib/schools-bundled.json");

  for (const p of [generalPath, ccaPath, subjectsPath, distinctivePath, ballotPath]) {
    if (!fs.existsSync(p)) {
      console.error("Missing input:", p);
      console.error("Run: npm run data:download");
      process.exit(1);
    }
  }

  const primaryRows = findPrimaryRows(generalPath);
  const ballots = parseBallotHtml(ballotPath);

  const ccaRows = parseCsv(fs.readFileSync(ccaPath, "utf8")).rows.filter(
    (r) => (r.school_section || "").toUpperCase() === "PRIMARY"
  );
  const subjectRows = parseCsv(fs.readFileSync(subjectsPath, "utf8")).rows;
  const distinctiveRows = parseCsv(fs.readFileSync(distinctivePath, "utf8")).rows;

  const ccaBySchool = indexBySchoolName(ccaRows, "School_name");
  const subjBySchool = indexBySchoolName(subjectRows, "School_Name");
  const bundled = [];
  const unmatched = [];

  for (const b of ballots) {
    const csv = matchCsvRow(b.slug, primaryRows);
    if (!csv) {
      unmatched.push(b.slug);
      continue;
    }

    const officialName = csv.school_name.trim();
    const upper = officialName.toUpperCase();
    const ccas = [
      ...new Set(
        (ccaBySchool.get(upper) || [])
          .map((r) => (r.cca_customized_name || r.cca_generic_name || "").trim())
          .filter(Boolean)
      )
    ].slice(0, 12);

    const subjects = [
      ...new Set((subjBySchool.get(upper) || []).map((r) => (r.Subject_Desc || "").trim()).filter(Boolean))
    ].slice(0, 16);

    const programmes = findDistinctiveRows(
      officialName,
      csv.mainlevel_code,
      distinctiveRows
    ).flatMap((r) =>
      [r.alp_title, r.llp_title]
        .filter(Boolean)
        .map((t) => String(t).trim())
    );

    const postal = String(csv.postal_code || "").replace(/\s+/g, "").trim();

    const p2a = b.phases["2A"] || {};
    const p2b = b.phases["2B"] || {};
    const p2c = b.phases["2C"] || {};

    const vac2c = p2c.vacancy;
    const app2c = p2c.applied;
    const ballotingPressure = pressureFromRatio(app2c, vac2c);
    const balloted2c = app2c != null && vac2c != null && app2c > vac2c;

    const ballotingHistory = [
      {
        year: 2025,
        phase: "2A",
        vacancies: p2a.vacancy ?? 0,
        applicants: p2a.applied ?? 0,
        balloted: (p2a.applied ?? 0) > (p2a.vacancy ?? 0)
      },
      {
        year: 2025,
        phase: "2B",
        vacancies: p2b.vacancy ?? 0,
        applicants: p2b.applied ?? 0,
        balloted: (p2b.applied ?? 0) > (p2b.vacancy ?? 0)
      },
      {
        year: 2025,
        phase: "2C",
        vacancies: p2c.vacancy ?? 0,
        applicants: p2c.applied ?? 0,
        balloted: balloted2c
      }
    ];

    const address = (csv.address || "").replace(/\s+/g, " ").trim();

    bundled.push({
      slug: b.slug,
      name: officialName.replace(/\s+/g, " ").trim(),
      address,
      postalCode: postal,
      lat: null,
      lng: null,
      distanceKm: null,
      ballotingPressure,
      intakeDirection: "no-change",
      intakeDelta: 0,
      ccas: ccas.length ? ccas : ["—"],
      programmes: programmes.length ? programmes.slice(0, 6) : ["—"],
      affiliation: null,
      subjects: subjects.length ? subjects : ["—"],
      distinctiveProgrammes: programmes.length ? programmes.slice(0, 6) : ["—"],
      affiliationNotes:
        "Affiliation pathways are not included in this MVP dataset. Check MOE / school sites for official affiliation rules.",
      ballotingHistory,
      sourceLinks: [
        {
          label: "data.gov.sg — General information of schools",
          url: "https://data.gov.sg/datasets/d_688b934f82c1059ed0a6993d2a829089/view",
          lastUpdated: "2026-04-17"
        },
        {
          label: "SG Schooling — P1 ballot history (unofficial aggregation)",
          url: "https://sgschooling.com/year/2025/all",
          lastUpdated: "2026-05-04"
        },
        {
          label: "MOE — Past vacancies and balloting (official reference)",
          url: "https://www.moe.gov.sg/primary/p1-registration/past-vacancies-and-balloting-data",
          lastUpdated: "2026-01-09"
        }
      ]
    });
  }

  bundled.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(outPath, JSON.stringify(bundled, null, 0), "utf8");
  console.log("Wrote", bundled.length, "schools to", path.relative(root, outPath));
  if (unmatched.length) {
    console.warn("Unmatched ballot slugs (no official row):", unmatched.length);
    console.warn(unmatched.slice(0, 25).join(", "), unmatched.length > 25 ? "…" : "");
  }
}

main();
