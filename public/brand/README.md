# TechTipsHub brand assets

Every identity asset the site serves lives in `techtipshub-web/public/brand`.
Nothing is referenced from anywhere else in `public` except the two files
platforms fetch by hard-coded name (`/favicon.ico` and
`/apple-touch-icon.png`), which are copies of the ones here.

## The mark

A square tile with a **T** carved into it. The square is a code block, the
letter is the name. Two shapes only, on one grid (128 units): the tile is
`x 26, y 26, 76 × 76, r 14`, the T is a 6-unit stem with an 11-unit crossbar.
The tile is always amber 400 and the T is always ink, in every asset and in
both themes: a white T on amber only reaches 2:1, an ink T reaches 9.3:1.
`Hub` is set separately in the wordmark, so `TechTips` and `Hub` can take two
colours without the letterforms fighting each other.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Amber (primary) | `#F2A93B` | Primary actions, current state, links, focus |
| Amber, hover | `#E3961F` | Pressed / hover on primary |
| Ink | `#141315` | Dark background, letterform on the tile |
| Paper | `#FCFAF6` | Light background |
| Warm neutral ramp | `#FAF7F2` to `#211E1B` | Surfaces, borders, secondary text |

Amber never carries body text directly on light surfaces. On `#FCFAF6` it
reaches about 2:1, which is fine for the tile and for a 2px underline but not
for a paragraph. Links on paper use amber-700 (`#9C600C`).

## Type

- **Fraunces** (display, variable) for headings, the wordmark and pull quotes.
- **Inter** for everything else, at 13 to 15px where most of the interface lives.

## Files

### Logo

| File | Size | Use |
| --- | --- | --- |
| `icon.svg` | 128 × 128 | Tile only, transparent background |
| `favicon.svg` | 128 × 128 | Tile with a baseline rule, for tabs |
| `logo-dark.svg` | 400 × 96 | Lockup with tagline, for dark surfaces |
| `logo-light.svg` | 400 × 96 | Lockup with tagline, for light surfaces |
| `logo-mark-dark.svg` | 400 × 72 | Lockup without tagline, dark |
| `logo-mark-light.svg` | 400 × 72 | Lockup without tagline, light |
| `logo-mono-dark.svg` | 400 × 72 | One-colour, outline tile, for dark |
| `logo-mono-light.svg` | 400 × 72 | One-colour, outline tile, for light |

SVG lockups keep their text as live `<text>` with the font named, so they stay
crisp at any size and remain readable to crawlers. On a machine without
Fraunces they fall back to a serif, never to a broken path.

### Social and SEO

| File | Size | Use |
| --- | --- | --- |
| `og-image.png` | 1200 × 630 | Default Open Graph card (dark) |
| `og-image-light.png` | 1200 × 630 | Light variant |
| `twitter-image.png` | 1200 × 630 | Twitter / X card |
| `og-square-1200.png` | 1200 × 1200 | Square previews, Pinterest, Instagram |
| `linkedin-banner-1128x191.png` | 1128 × 191 | LinkedIn company banner |
| `*.svg` | same | Editable sources for all of the above |

### Article covers

Generated covers for blogs that arrive without one, all on the brand ink:

| File | Variant |
| --- | --- |
| `cover-blocks.png` | Stacked blocks, Web Dev |
| `cover-frame.png` | Frame and lines, AI Tools |
| `cover-mark.png` | Mark beside text lines, Tutorial |

Each has a `.svg` source in the same folder.

### Icons and install

| File | Use |
| --- | --- |
| `favicon.ico` | 16/32/48 multi-size icon |
| `favicon-16.png`, `favicon-32.png` | Pinned tab / legacy |
| `apple-touch-icon.png` | 180 × 180, iOS home screen |
| `icon-192.png`, `icon-512.png` | Web app manifest |
| `app-icon-512.png` | Rounded app icon, for stores and press |
| `app-icon-maskable-512.png` | Android adaptive, safe zone respected |
| `site.webmanifest` | Manifest naming the icons above |

## Regenerating

The assets are produced from one script so the whole set stays in sync. It is
not committed because it only runs when the brand changes: it needs a headless
Chromium and the Fraunces woff2 files. Ask for `brand-assets/render.mjs` and
run it with `CHROME_PATH` and `PW_CORE` pointing at a Playwright install.
Output goes straight into `public/brand`.
