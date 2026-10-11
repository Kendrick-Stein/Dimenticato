# Independent review: reading-candidate test fixtures

Reviewed 11 October 2026 UTC. **Approved after the negative-case context correction.**

File: `tests/test-reading-candidates.js`

Final reviewed SHA-256: `2e95c50dee83edb0778b743a635164adb0551a04eb5d068d22d564908a8c26b4`

## Findings

- The fixed future date, 2026-10-11, ceased to be future when the daily queue reached that date. Deriving the next day from the queue's collection date preserves the original future-publication and future-collection rejection tests. The helper uses explicit UTC midnight and UTC formatting, avoiding local daylight-saving effects. Supplemental checks passed for the year boundary and leap day.
- The positive same-source publication-link fixture now includes all existing published articles as well as its synthetic matching article. This preserves other candidates' valid publication links instead of introducing unrelated missing-link errors.
- During review, the three related negative fixtures still used a truncated article list. In particular, the unrelated-link assertion could pass because four other candidates emitted the same error fragment. The final patch also supplies the complete article context to all three negative fixtures. This removes the false-positive route while retaining rejection of an unlinked published source, its tracking-query variant and an unrelated article link.
- A targeted in-memory check confirmed that complete context with the correct synthetic link produces no errors; changing only that link to `unrelated` produces exactly one error, identified with the intended candidate.
- No assertion was deleted, no expected error fragment was weakened, and no production-validator changes are present. All other original negative cases remain unchanged.

## Verification

Independent execution of `node tests/test-reading-candidates.js` against the final file: **63 passed, 0 failed**.

`git diff --check` for the test file passed. The validator's diff is empty. The full aggregate suite is a separate publishing-workflow check and is not claimed by this focused review.
