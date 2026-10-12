# Repository Classification Engine

WikiGerritTracker incorporates an ordered, deterministic classification engine that maps upstream Gerrit project names into recognizable Wikimedia technical subsystems.

---

## 1. Rule Evaluation Order

Rules are evaluated in strict priority order. The first matching pattern determines the category and normalized display label:

| Priority | Pattern | Category | Extracted Label Logic | Example Upstream Name | Display Label |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `^mediawiki/core$` | **Core** | Constant | `mediawiki/core` | MediaWiki Core |
| **2** | `^mediawiki/extensions/(.+)$` | **Extension** | `Extension: ${extracted}` | `mediawiki/extensions/MassMessage` | Extension: MassMessage |
| **3** | `^mediawiki/skins/(.+)$` | **Skin** | `Skin: ${extracted}` | `mediawiki/skins/Vector` | Skin: Vector |
| **4** | `^pywikibot/(.+)$` | **Bot ecosystem** | `Pywikibot: ${extracted}` | `pywikibot/core` | Pywikibot: core |
| **5** | `^design/codex.*$` | **Design system** | Constant (`Codex`) | `design/codex-tokens` | Codex |
| **6** | `^operations/(.+)$` | **Infrastructure** | `Operations: ${extracted}` | `operations/puppet` | Operations: puppet |
| **7** | Fallback | **Other** | Preserves original name | `wikidata/query/gui` | wikidata/query/gui |

---

## 2. Design Principles

1. **Original Name Preservation:**
   - The original project identifier (e.g. `mediawiki/extensions/VisualEditor`) is always preserved alongside the normalized display label.
   - Upstream Gerrit verification URLs always target the raw project identifier (`https://gerrit.wikimedia.org/r/q/project:mediawiki%2Fextensions%2FVisualEditor`).

2. **Null & Edge-Case Safety:**
   - Empty, null, or undefined inputs gracefully resolve to category `Other` with label `Unknown Repository`.

3. **Extensibility:**
   - Rules are defined as an array of `ClassificationRule` objects in `rules.ts`, making it straightforward to add new subsystems (such as Wikibase, Service infra, or Kiwix) without altering core analytics logic.
