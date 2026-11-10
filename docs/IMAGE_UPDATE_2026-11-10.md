# Image update — 10 November 2026

Exhibit 039: FOUNTAIN PENS. Original artwork created with the built-in image generator, not an archival photograph. Generic pen, separate cap and ink bottle; no claim to an exact Pelikan model.

## Complete prompt

Use case: historical-scene. Asset type: monochrome e-ink museum exhibit illustration. Primary request: original fine black ink engraving of a generic modern refillable fountain pen, uncapped, with its complete pointed split metal nib clearly visible and a separate cap alongside; one small closed unlabelled ink bottle behind it. No specific manufacturer design. White paper background, no scene or hands. Three-quarter overhead product composition, whole objects centered, large clean white margins on every side, landscape composition. Crisp bold silhouettes and restrained crosshatching that survive small monochrome displays; pure grayscale, no color, no text, no letters, no branding, no border, no watermark. Do not crop nib, barrel, cap or bottle.

## Exports

- `assets/exhibits/responsive-v2/fountain-pens-master-2x1.jpg`: 1600×800, grayscale 8-bit JPEG, quality 87.
- `assets/exhibits/responsive-v2/fountain-pens-standard-4x3.jpg`: 1067×800, grayscale 8-bit JPEG, quality 87.
- `assets/exhibits/fountain-pens.jpg` mirrors the standard export for legacy consumers.

Wide: trim blank paper only, contain subject within 1180×430 and center on white 1600×800. Standard: contain the complete source within 977×680 and center on white 1067×800. No subject crop. This preserves complete object silhouettes inside the shallow OG Full image region; standard is independently fitted rather than cropped from wide.

## Review gate

Inspect both exports and all four layouts on OG, X landscape and X portrait. Require data/candidate validation, Saved State tests, website build, asset checks, trmnlp lint and exact-head hosted render checks before opening/merging. The PR records run IDs, artifact reviews and final results.
