# Starter validation

Data, candidate ratings, source scope and transform checks are run before merge.

The pinned `trmnl_preview` 0.34.0 workflow renders Full, Half Horizontal, Half Vertical and Quadrant for OG, X landscape and X portrait. The pin replaces 0.14.2 after that version's 4-bit previews showed gray trails extending outside the image box. The newer quantizer avoids the older second palette reduction. The renderer applies the X panel's 1.8× scale at capture, so the workflow captures at 1872×1404 (or 1404×1872 portrait), not the 1040×780 CSS size. OG remains 800×480 at 1 bit and X remains 4 bit. CI serves the checked-out catalogue locally. Production polling remains the raw GitHub main URL.

Transform coverage: complete no-repeat cycle/reset; filtered pools; unknown/whitespace/case settings; stale and duplicate history; empty data; malformed entries; one-entry pools; duplicate IDs; invalid seed; bounded state keys.

Run [37674116731](https://github.com/michaelkurath/TRMNL-Still-Here/actions/runs/37674116731) passed all schema, transform, lint and render checks. All twelve normal OG/X/X-portrait screenshots and both empty-state screenshots were inspected. COBOL rendered cleanly in all views. Review identified two small labels to improve: the empty-state footer and the compact location badge. A subsequent run also renders each starter exhibit individually through its category filter. Physical-device tests and TRMNL recipe publication remain separate follow-up steps.
