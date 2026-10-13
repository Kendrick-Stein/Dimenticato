# 2026-10-13 candidate-test fixture review

Recommendation: accept the three narrowly scoped negative-fixture corrections in `tests/test-reading-candidates.js`. They preserve the intended rejection tests and do not weaken validation.

The first real candidate has now completed editorial review and links to its separately published edition. The old tests implicitly assumed that its review flag was false and its publication link empty. Those assumptions no longer hold: merely setting its stage to `ready` or adding a same-source fixture does not create invalid data.

The inspected diff changes exactly three negative setups plus two explanatory comments:

1. The `ready`-stage test explicitly sets `editorialReviewComplete = false`. This constructs the incomplete-review condition that the unchanged validator is meant to reject.
2. The already-published-source test explicitly removes `linkToArticleId`. This constructs the missing-link condition instead of relying on the current reserve data to be unconverted.
3. The tracking-query version removes the link as well as appending the UTM query, preserving coverage that canonical source matching rejects recycling even with a tracking parameter.

Independent execution confirmed that each corrected case returns exactly its intended validation error. The unrelated-link negative case still rejects. The unchanged positive case accepts an exact same-source, same-language link while `readyForPublication` remains false; recording separate publication does not promote reserve metadata into an article.

`scripts/validate_reading_candidates.js` is byte-for-byte unchanged against the prior commit. The actual candidate test file passes: 67 passed, 0 failed. No product code or assertion was removed or relaxed.

Reviewed test-file SHA-256: `bfab6217dde5b257fc0c827bd8e4c0ef77e34e1fb3e5484fae602c7b3e0c9c8b`.
