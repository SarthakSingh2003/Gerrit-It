# WikiGerritTracker API Reference

This document points to the complete REST API specification.

Please refer to:
- [API Specification](./API_SPECIFICATION.md) for full endpoints, parameters, request/response formats, status codes, and error models.

### Quick Endpoints Summary

- `GET /healthz` or `GET /api/health`: Health status, cache metrics, uptime.
- `GET /api/version`: Application version and build metadata.
- `GET /api/contributors/:identifier`: Canonical Gerrit account identity resolution.
- `GET /api/contributors/:identifier/summary`: Aggregated contribution metrics with preset or custom date ranges.
- `GET /api/contributors/:identifier/repositories`: Per-repository distribution.
- `GET /api/contributors/:identifier/changes`: Paginated patch set changes (authored or reviewed).
- `GET /api/contributors/:identifier/reviews`: Peer review actions (CR+2, CR+1, V+1).
- `GET /api/contributors/:identifier/report`: Verifiable scholarship dossier in JSON or Markdown format.
- `POST /api/cohorts/analyze`: Multi-contributor cohort batch metrics with deduplication.
- `GET /api/repositories/classification`: Active repository regex rules and interactive test endpoint.
