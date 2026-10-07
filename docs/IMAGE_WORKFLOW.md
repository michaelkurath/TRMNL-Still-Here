# Image workflow

All exhibit artwork is interpretive monochrome illustration. Do not describe it as archival photography or evidence of a location’s present appearance.

New coelacanth and COBOL illustrations were generated with the built-in image generator. The video-store illustration was reused from Michael Kurath’s GOODBYE under its CC BY 4.0 attribution terms. The complete-frame-and-sprout SVG extends the template’s vector frame system.

## Asset paths

- `assets/exhibits/<id>.jpg`: grayscale exhibit master
- `assets/exhibits/responsive-v2/<id>-master-2x1.jpg`: 1600×800 wide artwork
- `assets/exhibits/responsive-v2/<id>-standard-4x3.jpg`: 1067×800 centered standard crop
- `assets/icon/still-here-icon.svg` and `still-here-icon.png`: vector source and 512×512 PNG

Inspect all subject edges in both crops. Render OG at 1-bit and X at 4-bit; the wide image is used for Full and the standard image for compact layouts. Never reuse source photographs without checking licensing.

## Generation prompts

Coelacanth: one anatomically plausible West Indian Ocean coelacanth swimming side-on in deep water beside a restrained rocky submarine slope; fleshy lobed fins, heavy scales and three-lobed tail; detailed black-and-white natural-history engraving, strong silhouette, high contrast; landscape 2:1 with complete fish centrally framed for a safe 4:3 crop; subdued water and rocks at the sides; no text, logos, borders or watermark.

COBOL: a complete historical operator terminal with CRT and keyboard in front of mainframe cabinets; abstract short code lines without readable words; black-and-white technical engraving, realistic proportions, high contrast; landscape 2:1 with central hardware safe for a 4:3 crop; quiet server-room background; no people, logos, borders or watermark. It illustrates continuity of business computing, not a requirement to use historical hardware.

The new masters were converted to 8-bit grayscale JPEG and exported at quality 88. Generated source PNGs are not runtime dependencies.

## London gas lamps — exhibit 004

Built-in image generator prompt: Use case: illustration-story. Asset: TRMNL STILL HERE museum exhibit. One working historic London gas street lamp, a plausible cast-iron column and Rochester-style lantern with visible inverted glowing gas mantles, in a quiet Covent Garden cobbled lane at dusk. Detailed monochrome engraving, high contrast black and white, restrained atmosphere, recognizable lamp entire lantern and most column centrally framed. Landscape 2:1 composition, main subject safely inside central 4:3 crop. No people, readable text, logos, borders or watermark. Interpretive illustration, not an archival photo.

Assets: `assets/exhibits/london-gas-lamps.jpg`, `responsive-v2/london-gas-lamps-master-2x1.jpg` (1600×800) and `responsive-v2/london-gas-lamps-standard-4x3.jpg` (1067×800). This is a generic interpretive streetscape, not a representation of the exact protected Russell Street lamps. Central lantern and column remain visible in both crops. Source and text review passed on 7 October 2026; promotion is gated on OG/X render review before merge. Candidate editorial rating: 24/25.
