## Goal

Replace every generic stock image on the home page with polished, AI-generated **close-up fabric textures** made directly from your own real photos — curtains (sheer/embroidered) and upholstery (woven, velvet, chenille) — matching each real pattern as closely as possible. Each image is cleaned up (hands, people, showroom clutter, floor removed), brightened, and reframed to fit its slot.

## Photo inventory

**Curtains (8):** leaf-vine + flowers, geometric knots, gold paisley-feather, fern/wispy leaves, pom-pom trim, taupe circles/donuts, square gold chains, modern linked-rectangles.

**Upholstery (9):** grey chenille/velvet plush, cream plain weave, light taupe weave, charcoal weave, ivory satin-smooth, terracotta/rust weave, cream basketweave check, ivory bouclé.

## Slot-by-slot mapping

**1. Hero slider** (`HeroSlider.tsx`) — 3 landscape images
| Slide | New image |
|---|---|
| ADAM Premium (intro) | Premium grey velvet/chenille close-up |
| Upholstery Collection | Terracotta woven texture |
| Curtains Collection | Leaf-vine embroidered sheer |

**2. Category circles** (`CategoryCircles.tsx`) — 6 square thumbnails
| Type | New image |
|---|---|
| Velvet | Grey chenille velvet |
| Cotton | Cream plain weave |
| Silk | Fern/wispy sheer curtain |
| Linen | Light taupe weave |
| Satin | Ivory satin-smooth |
| Denim | Charcoal weave |

**3. Collection banners** (`CollectionBanners.tsx`) — 3 images
| Banner | New image |
|---|---|
| Upholstery Collection | Ivory bouclé texture |
| New Collection | Cream basketweave check |
| Curtains Collection | Geometric-knot sheer |

**4. Sticky-scroll showcase** (`StickyScrollFabrics.tsx`) — 9 swatches
| Slide | New image |
|---|---|
| Royal Velvet | Grey velvet plush |
| Egyptian Cotton | Cream plain weave |
| Luxury Silk (curtain) | Fern sheer |
| Natural Linen | Taupe weave |
| Royal Satin (curtain) | Square gold-chain sheer |
| Practical Denim | Charcoal weave |
| Light Polyester (curtain) | Pom-pom / circles sheer |
| Emerald Velvet | Grey velvet recolored emerald green (color name is in the label) |
| Terracotta Cotton | Terracotta/rust weave |

## How images are made

- Use the AI image **edit** tool on each real photo, e.g.: *"Clean, bright professional close-up product shot of this exact fabric texture/pattern, neutral evenly-lit background, no hands, no people, no clutter, preserve the exact weave/embroidery and color."*
- Reframed per slot: landscape (~1600×900) for hero, square (~1000×1000) for circles, swatches, and banners.
- Saved as new `.jpg` files in `src/assets/` (e.g. `up-velvet.jpg`, `up-cotton.jpg`, `cur-leaf.jpg`, …). Old generic assets are left in place but no longer imported.

## Components edited

Only four files, all simple import swaps — no layout or logic changes:
- `src/components/HeroSlider.tsx`
- `src/components/CategoryCircles.tsx`
- `src/components/CollectionBanners.tsx`
- `src/components/StickyScrollFabrics.tsx`

## Verification

After wiring, confirm the build is clean and spot-check the home page (hero, circles, banners, sticky scroll) renders the new textures with no broken images.

## Note on "Emerald Velvet"

That sticky-scroll slide is labeled green. Since none of your photos are green, I'll AI-recolor a real velvet texture to emerald so the label stays honest — say the word if you'd rather I rename it or leave it grey.