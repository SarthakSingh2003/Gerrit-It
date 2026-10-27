# Contribution Metric Definitions & Semantic Standards

Gerrit-It strictly documents how each analytical metric is calculated from Gerrit REST records.

---

## 1. The Eight Core Contributor Metrics

1. **Total Authored Changes:**
   - *Definition:* Total distinct Gerrit changes where the contributor is listed as `owner`.
   - *Query:* `owner:<account_id>`
   - *Semantics:* Represents authored code proposals submitted to Gerrit.

2. **Merged Patches:**
   - *Definition:* Changes with status `MERGED` successfully integrated into an upstream branch.
   - *Query:* `owner:<account_id> status:merged`

3. **Open / In Review Patches:**
   - *Definition:* Changes with status `NEW` actively awaiting code review, author updates, or automated CI tests.
   - *Query:* `owner:<account_id> status:open`

4. **Abandoned Patches:**
   - *Definition:* Changes closed with status `ABANDONED` without being merged (e.g. superseded by an alternative implementation or duplicate).
   - *Query:* `owner:<account_id> status:abandoned`

5. **Distinct Changes Reviewed:**
   - *Definition:* Changes authored by other contributors where this contributor participated as a reviewer.
   - *Query:* `reviewer:<account_id> -owner:<account_id>`
   - *Deduplication:* Multiple review updates or comments on different patch sets of the same change are counted only once. Self-reviews are strictly excluded.

6. **Verified Approvals (Code-Review +2):**
   - *Definition:* Changes where the contributor voted `Code-Review +2` (Approved) in the change labels approval matrix.
   - *Semantics:* Direct indicator of technical peer review and merge gating.

7. **Repositories Impacted:**
   - *Definition:* Cardinality of the unique set of Gerrit repositories where the contributor authored patches (`Set<change.project>`).

8. **First Recorded Contribution Date:**
   - *Definition:* The earliest `created` timestamp found among the retrieved change records.
   - *Boundary Note:* If results are capped by the pagination safety budget (e.g. 2,000 changes), the earliest timestamp represents the earliest retrieved record within the budget window.

---

## 2. Date Semantics: Creation Date vs Merge Date

When evaluating contributions within a custom date range:
- **Merged Patches:** Evaluated by the merge submission timestamp (`submitted`). If the patch was created in December 2023 but merged in February 2024, it is attributed to 2024 when filtering for merged impact.
- **Open and Abandoned Patches:** Evaluated by the initial proposal timestamp (`created`).
- **Code Reviews:** Evaluated by the date the contributor's label vote was cast, or the change update timestamp (`updated`).

---

## 3. Review Intelligence Metrics

- **Review Recommendations (`Code-Review +1`):** Constructive feedback voting that the patch looks good but leaves final merge approval to project maintainers.
- **Automated/Verified Checks (`Verified +1` or `+2`):** CI or manual verification passes.
- **Actionable Critiques (`Code-Review -1` or `-2`):** Feedback requesting changes or blocking broken patches.
- **Mentorship Disclaimer:** High review volume demonstrates active peer review and community collaboration across repositories. It does not constitute formal proof of 1-on-1 mentorship.
