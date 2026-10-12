# Security Policy — WikiGerritTracker

The maintainers of WikiGerritTracker take the security of this project and the Wikimedia developer community seriously.

---

## Supported Versions

Only the current main release branch receives security patches and dependency updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability or potential threat in WikiGerritTracker, please report it responsibly:

1. **GitHub Private Vulnerability Reporting (Recommended):**
   Navigate to the **Security** tab of this repository on GitHub and select **Report a vulnerability**. This creates a confidential advisory between you and the repository maintainers.

2. **Public Disclosure:**
   Please do not report security vulnerabilities through public GitHub issues, discussions, or social media until the issue has been reviewed and a fix released.

### What to Include in Your Report
To help us triage and resolve the issue quickly, please provide:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal proof of concept.
- Affected endpoints, modules, or configurations.
- Any suggested mitigations.

---

## Security Architecture & Threat Model

WikiGerritTracker is designed with the following security safeguards:
- **Read-Only Public Data:** The application only retrieves public Gerrit records; it does not collect user credentials, passwords, or private Wikimedia access tokens.
- **SSRF & Query Injection Mitigation:** The backend constructs all upstream requests using structured query builders and strict input validation via Zod. Arbitrary URL fetching is rejected.
- **Same-Origin & CORS Protection:** The frontend communicates with Gerrit exclusively through our hardened backend proxy.
- **Input Sanitization & XSSI Handling:** Gerrit anti-XSSI security prefixes (`)]}'\n`) are stripped safely before JSON parsing.
- **Rate Limiting & Throttling:** Built-in IP rate limiters mitigate denial-of-service attempts against backend analytics endpoints.
- **Privacy By Design:** The application avoids email scraping and email enumeration, displaying only public usernames, display names, and numeric account IDs. Local search history is stored in the browser only with explicit user consent.
