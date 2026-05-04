export const officialSources = [
  {
    metric: "School profile and address",
    source: "data.gov.sg - General information of schools",
    url: "https://data.gov.sg/datasets/d_688b934f82c1059ed0a6993d2a829089/view",
    updateCadence: "Periodic MOE refresh on data.gov.sg",
    lastUpdated: "2026-04-17"
  },
  {
    metric: "CCA offerings",
    source: "data.gov.sg - Co-curricular activities (CCAs)",
    url: "https://data.gov.sg/datasets/d_9aba12b5527843afb0b2e8e4ed6ac6bd/view",
    updateCadence: "Periodic MOE refresh on data.gov.sg",
    lastUpdated: "2026-04-17"
  },
  {
    metric: "Subjects offered",
    source: "data.gov.sg - Subjects Offered",
    url: "https://data.gov.sg/datasets/d_f1d144e423570c9d84dbc5102c2e664d/view",
    updateCadence: "Periodic MOE refresh on data.gov.sg",
    lastUpdated: "2026-04-17"
  },
  {
    metric: "Distinctive programmes",
    source: "data.gov.sg - School Distinctive Programmes",
    url: "https://data.gov.sg/datasets/d_db1faeea02c646fa3abccfa5aba99214/view",
    updateCadence: "Periodic MOE refresh on data.gov.sg",
    lastUpdated: "2025-07-23"
  },
  {
    metric: "P1 phases and registration policy",
    source: "MOE - P1 Registration",
    url: "https://www.moe.gov.sg/primary/p1-registration",
    updateCadence: "As announced by MOE",
    lastUpdated: "2026-04-29"
  },
  {
    metric: "Historical vacancies and balloting data",
    source: "MOE - Past vacancies and balloting data",
    url: "https://www.moe.gov.sg/primary/p1-registration/past-vacancies-and-balloting-data",
    updateCadence: "Annual cycle",
    lastUpdated: "2026-01-09"
  }
];

export const contextualReferenceSources = [
  {
    metric: "P1 vacancy / applicant / balloting table (2025 exercise)",
    source: "SG Schooling (third-party compilation)",
    url: "https://sgschooling.com/year/2025/all",
    note: "MVP uses a point-in-time ingest for ballot pressure and phase ratios. Always cross-check MOE official tables before registration decisions."
  },
  {
    metric: "Latest intake increase/decrease context",
    source: "CNA report",
    url: "https://www.channelnewsasia.com/singapore/schools-cut-primary-1-intake-increase-spaces-registration-exercise-6088376",
    note: "Context reference only; not a substitute for official structured datasets."
  }
];
