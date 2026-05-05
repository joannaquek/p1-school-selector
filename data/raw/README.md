# Raw data inputs

| File | Source |
|------|--------|
| `general-information-of-schools.csv` | data.gov.sg — MOE general information of schools |
| `cca.csv` | data.gov.sg — CCAs |
| `subjects.csv` | data.gov.sg — subjects offered |
| `distinctive.csv` | data.gov.sg — distinctive programmes |
| `sgschooling-<year>-all.html` | [SG Schooling](https://sgschooling.com/year/) — **unofficial** P1 ballot tables (scraped yearly snapshots, currently 2020–2025) |

Populate this folder with:

```bash
npm run data:download
npm run data:build
npm run data:geocode
```

`data:download` respects data.gov.sg rate limits (~11s between dataset calls without an API key). For faster runs, register a free key at [data.gov.sg API](https://guide.data.gov.sg/developer-guide/api-overview/how-to-request-an-api-key.md) and set `DATA_GOV_SG_API_KEY` in the environment.
