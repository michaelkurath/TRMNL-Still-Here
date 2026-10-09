# STILL HERE for TRMNL

**Unexpected survivors, every refresh.**

A quiet museum of species, technologies, and places people assume have disappeared—but which still exist or function. Each exhibit explains what survives, why, and where. Survival is not a claim of popularity, safety from extinction, or unchanged identity.

Adapted from [Michael Kurath’s GOODBYE](https://github.com/michaelkurath/TRMNL-Goodbye) at commit `63f7b5d59b2be6b096d42b41b78929d9d8e20621`. The established Framework 3.3.1 layouts, catalogue structure, Saved State rotation, candidate review system, and companion website are reused.

## Starter collection

| Live exhibit | Survival evidence |
| --- | --- |
| African coelacanth | NOAA Fisheries: rediscovered in 1938; living populations persist |
| COBOL | IBM: ongoing financial and administrative applications |
| The last Blockbuster | Bend store’s own site: physical rentals remain available |
| London gas lamps | Historic England: working gas lamps protected as heritage |
| Wollemi pine | Kew: rediscovery in 1994 and continuing conservation collections |
| Solent hovercraft | Hovertravel: passenger crossings between Southsea and Ryde |
| Morse code | ARRL W1AW: on-air code practice and bulletins |
| Hospital pneumatic tubes | Swisslog Healthcare: current specimen transport systems |
| Brienz Rothorn Bahn | Operator: seasonal steam railway and 2026 tickets |

**9 live exhibits and 14 candidates.** Pneumatic tubes and the Brienz Rothorn Bahn are exhibits 008 and 009. New candidates: fountain pens (22/25) and Gopher (20/25). Candidates remain outside production until all review gates pass. Sources and qualifications are stored with each entry.

## Install / GitHub sync

Repository: https://github.com/michaelkurath/TRMNL-Still-Here

The existing Still Here plugin (`498915`) can sync this repository’s `src` folder through GitHub import/sync. Select Polling and the Node serverless transform. The newly created Still Here ID is preserved; GOODBYE’s ID is not used.

- Polling source: `https://raw.githubusercontent.com/michaelkurath/TRMNL-Still-Here/main/data/trmnl.json`
- Transform: `src/transform.js`, exposing `run(input)`
- Markup: shared plus Full, Half Horizontal, Half Vertical, and Quadrant
- Category: `all`, `technology`, `internet`, `transport`, `nature`, `everyday`
- Refresh: 15 minutes

A public recipe URL will be added after the recipe is published. This repository does not imply that a recipe is already published.

## Selection

GOODBYE’s per-installation, per-category no-repeat Saved State rotation is retained. A deterministic 15-minute UTC slot seed selects from unseen entries; history prevents repeats within each category cycle. Different installation histories may show different exhibits. Category cycles are independent. One-entry pools necessarily repeat. Removed IDs, duplicate history and invalid settings are normalized. Clear Saved State in TRMNL to restart the rotation.

The polling response must be a JSON object with a top-level `items` array, as in `data/trmnl.json`. Bare arrays, `results` wrappers and nested `data.items` are unsupported and show the unavailable screen.

Without the transform, Liquid falls back to the first entry. Empty data shows an explicit unavailable screen. The companion website selects its daily exhibit by UTC date.

## Data and review

`data/trmnl.json` is the production payload. Entries contain `timeline`, `verified_on`, `verified_year`, `headline`, `why_survives`, `where_now`, source, scope note, and monochrome image URLs. `timeline` can be a rediscovery milestone rather than an invented lifespan. `verified_on` is an editorial check date, not an automated availability guarantee.

`data/candidates.json` contains provisional editorial scores for recognition, visual strength, story strength, survival evidence, and catalogue fit (each 1–5). See [ROADMAP.md](ROADMAP.md) for the promotion gate.

```sh
node scripts/validate-data.js
node scripts/validate-candidates.js
node scripts/test-transform.js
gem install trmnl_preview --version 0.14.2
trmnlp lint
trmnlp serve
```

CI validates and renders all four layouts at OG 800×480, X 1040×780, and X portrait 780×1040. Rendered output must also be visually reviewed. See [docs/VALIDATION.md](docs/VALIDATION.md).

## Images, icon, and website

Original interpretive monochrome illustrations, not documentary photographs. Coelacanth and COBOL are new; the video-store illustration is reused from GOODBYE with attribution. Every exhibit has a 2:1 master and 4:3 crop. Prompts, asset paths, and crop rules: [docs/IMAGE_WORKFLOW.md](docs/IMAGE_WORKFLOW.md).

The vector icon extends GOODBYE’s frame into a complete frame with a living sprout: `assets/icon/still-here-icon.svg` and `assets/icon/still-here-icon.png`.

The [companion website](https://michaelkurath.github.io/TRMNL-Still-Here/) presents today’s exhibit, a random exhibit, category filters, the full live collection and source links. It uses the same production catalogue as the plugin.

`website/` contains the source. Build locally with `node scripts/build-website.js`, then serve `_site/`. The Website workflow builds and previews desktop/mobile views on pull requests, and publishes `_site/` to GitHub Pages on changes to the live catalogue, artwork or website on `main`. In repository Settings → Pages, select GitHub Actions as the publishing source.

## License

[TRMNL Community Plugin terms](https://trmnl.com/plugin-license), with CC BY 4.0 attribution as described in [LICENSE.md](LICENSE.md). Copyright 2026 Michael Kurath.

Latest collection update: **9 live exhibits and 14 candidates**. See [9 October review](docs/PROMOTION_2026-10-09.md).
