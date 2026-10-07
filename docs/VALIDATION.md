# Starter validation

Data, candidate ratings, source scope and transform checks are run before merge.

The inherited pinned `trmnl_preview` 0.14.2 workflow renders Full, Half Horizontal, Half Vertical and Quadrant for OG, X landscape and X portrait. CI serves the checked-out catalogue locally, so it tests the PR payload rather than a cached main-branch payload. Production polling remains the raw GitHub main URL.

Transform coverage: complete no-repeat cycle/reset; filtered pools; unknown/whitespace/case settings; stale and duplicate history; empty data; malformed entries; one-entry pools; duplicate IDs; invalid seed; bounded state keys.

Manual screenshot review and final CI result are recorded here once complete. Physical-device tests and TRMNL recipe publication remain separate follow-up steps.
