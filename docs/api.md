# Gerrit-It API Reference

For the full REST API endpoint reference, see **[API_SPECIFICATION.md](API_SPECIFICATION.md)**.

## Quick Endpoint Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health status, cache metrics, uptime |
| `/api/version` | `GET` | Application version and build metadata |
| `/api/contributors/:id` | `GET` | Canonical Gerrit identity resolution |
| `/api/contributors/:id/summary` | `GET` | Contribution metrics (authored vs reviews, subsystem split) |
| `/api/contributors/:id/repositories` | `GET` | Per-repository patch and review aggregations |
| `/api/contributors/:id/changes` | `GET` | Normalized patch listings (authored or reviewed) |
| `/api/contributors/:id/reviews` | `GET` | Peer review breakdown (CR+2 approvals, recommendations) |
| `/api/contributors/:id/report` | `GET` | Verifiable contribution dossier (JSON or Markdown) |
| `/api/cohorts/analyze` | `POST` | Batch group analytics with deduplicated repo counts |
| `/api/repositories/classification` | `GET` | Classification engine regex rules and tester |

All endpoints return a uniform JSON response envelope:

```json
{
  "data": {},
  "meta": { "source": "Wikimedia Gerrit", "cached": true, "complete": true },
  "error": null
}
```
