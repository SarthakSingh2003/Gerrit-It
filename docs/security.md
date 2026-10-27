# Security Guidelines — Gerrit-It

For the full security policy and vulnerability reporting process, see **[SECURITY.md](../SECURITY.md)** at the project root.

For the detailed technical security architecture and threat model, see **[security.md](security.md)** in this docs directory.

## Summary of Security Controls

- **Read-Only Public Data:** Only retrieves public Gerrit records — no user credentials or private tokens.
- **SSRF Defense:** All upstream requests are built via structured internal query builders; no open proxying.
- **Zod Input Validation:** All user-supplied parameters are validated and sanitized before use.
- **Anti-XSSI Parsing:** Gerrit's `)]}'\\n` prefix is stripped safely before JSON deserialization.
- **Rate Limiting:** 120 requests per IP per minute (configurable via `RATE_LIMIT_MAX_REQUESTS`).
- **No Email Enumeration:** Only public display names, usernames, and numeric account IDs are surfaced.
- **Opt-in Search History:** Stored in browser `localStorage` only with explicit user consent.
