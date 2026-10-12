# WikiGerritTracker — Backend API Specification

All endpoints follow a uniform JSON response contract:

```json
{
  "data": {},
  "meta": {
    "source": "Wikimedia Gerrit",
    "generatedAt": "2026-10-12T12:00:00.000Z",
    "cached": true,
    "stale": false,
    "complete": true,
    "recordsRetrieved": 100,
    "paginationBudgetHit": false,
    "queryExecutionMs": 15,
    "warnings": []
  },
  "error": null
}
```

---

## 1. System Endpoints

### `GET /api/health`
Checks server operational readiness, uptime, and cache statistics.

**Response:**
```json
{
  "status": "healthy",
  "uptimeSeconds": 120,
  "timestamp": "2026-10-12T12:00:00.000Z",
  "service": "WikiGerritTracker Backend",
  "version": "1.0.0",
  "cache": {
    "type": "memory",
    "healthy": true,
    "itemsTracked": 14
  }
}
```

### `GET /api/version`
Returns software version, license, and upstream references.

---

## 2. Contributor Analytics Endpoints

### `GET /api/contributors/:identifier`
Resolves a raw username, account ID, or search query to a canonical Gerrit account.

**Parameters:**
- `identifier` (path, string): Username or numeric Gerrit Account ID.

**Response:**
```json
{
  "data": {
    "accountId": 458,
    "username": "legoktm",
    "displayName": "Legoktm",
    "registeredOn": "2016-07-25 01:42:27.000000000",
    "statusText": "🌻",
    "gerritProfileUrl": "https://gerrit.wikimedia.org/r/q/owner:458"
  }
}
```

### `GET /api/contributors/:identifier/summary`
Calculates comprehensive contribution metrics over a date range.

**Query Parameters:**
- `preset` (optional, string): `last_7_days`, `last_14_days`, `last_30_days`, `last_60_days`, `last_90_days`, `last_180_days`, `last_365_days`, `lifetime`.
- `startDate` (optional, string): Format `YYYY-MM-DD`.
- `endDate` (optional, string): Format `YYYY-MM-DD`.

**Response Data Fields:**
- `contributor`: Canonical account details.
- `authored`: `totalAuthored`, `merged`, `open`, `abandoned`, `uniqueRepositories`, `firstRecordedDate`, `lastRecordedDate`, `totalInsertions`, `totalDeletions`.
- `reviews`: `distinctChangesReviewed`, `approvalsCount` (CR+2), `recommendationsCount` (CR+1), `verifiedCount` (V+1), `critiquesCount`, `uniqueReviewRepositories`, `mentorshipDisclaimer`.
- `categoryBreakdown`: Array of `{ category, count, percentage }`.
- `repositoriesImpacted`: Number of distinct repositories.

### `GET /api/contributors/:identifier/repositories`
Aggregates patch activity and review participation per repository.

**Response:** Array of `{ project, category, categoryLabel, mergedCount, openCount, abandonedCount, reviewedCount, totalAuthored, gerritUrl }`.

### `GET /api/contributors/:identifier/changes`
Returns normalized individual patch records.

**Query Parameters:**
- `type` (optional, string): `authored` (default) or `reviewed`.
- `limit` (optional, number): Number of records per page (default 100).
- `offset` (optional, number): Pagination offset.

### `GET /api/contributors/:identifier/reviews`
Returns code review participation metrics alongside a sample of reviewed changes.

### `GET /api/contributors/:identifier/report`
Generates an independently verifiable contribution and activity report.

**Query Parameters:**
- `format` (optional, string): `json` (default) or `markdown` (returns raw markdown file download).
- `includeRepositories` (optional, boolean): Whether to embed top repositories table.
- `maxRepositories` (optional, number): Max repositories in table (default 15).

---

## 3. Classification Endpoints

### `GET /api/repositories/classification`
Lists active repository classification rules and categories. Supports `?test=<projectName>` to simulate rule matching.

---

## 4. Cohort Analytics Endpoints (Phase 2)

### `POST /api/cohorts/analyze`
Analyzes group contribution footprint across multiple usernames with deduplicated shared repository coverage.

**Request Body:**
```json
{
  "identifiers": ["legoktm", "reedy", "krinkle"],
  "preset": "last_30_days"
}
```

**Response:**
Returns `members`, `cohortTotals` (combined authored, combined merged, combined reviews, unique deduplicated repos, top shared repos), `markdownReport`, and `csvReport`.
