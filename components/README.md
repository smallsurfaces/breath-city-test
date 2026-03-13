# Component Catalogue

Documented UI components extracted from breathecities.org. Each entry maps the visual pattern to the design tokens it uses.

---

## Navigation

### NavigationMain
- Height: `70px` (CSS var `--navigation-height`)
- Background: `var(--bc-semantic-bg)` / `#ffffff`
- Text: `var(--bc-semantic-text)` / `#003574`
- Mobile: hamburger (`NavigationBurger`) below `780px`

### NavigationFooter
- Background: `var(--bc-color-darkBlue)` / `#003574`
- Text: `var(--bc-color-white)` / `#ffffff`

---

## Buttons

All buttons use `border-radius: var(--bc-border-radius-pill)` (9999px) or `var(--bc-border-radius-md)` (10px).

| Variant | Class | Background | Text | Hover |
|---|---|---|---|---|
| Primary | `button--brand` | `#0071c7` | white | `#23bced` |
| Accent | `button--accent` | `#003574` | white | `#23bced` |
| Outline | `button--outline` | transparent | `#003574` | `#23bced` |
| Outline White | `button--outlineWhite` | transparent | white | `#23bced` |
| Arrow | `button--arrow` | brand/accent | white | lighter | 55×55px circle |
| Link | `button--link` | none | brand | hover colour |
| External | `button--external` | — | brand | — | with external icon |
| Card | `button--card` | — | — | — | overlay on card hover |
| Icon | `button--icon` | — | — | — | icon-only, 55×55px |

Transition: `var(--bc-transition-fast)` (200ms ease-in-out)

---

## Hero / BlockHeader

- Full-width section
- Large heading: `font-titleLarge` (4rem → 5.25rem)
- Subheading: `font-titleSub` (1.125rem → 1.625rem)
- Background: white or `darkBlue` depending on variant
- Can include contact form (`BlockHeroContactFormH`)

---

## Cards

- Border-radius: `var(--bc-border-radius-md)` / `10px`
- Shadow: none (flat design)
- Image: `object-fit: cover`, aspect ratios vary (3:2, 4:3, 16:9)
- Hover: `button--card` overlay

---

## Content Blocks

| Component | Description |
|---|---|
| `BlockImageText` | Alternating image + text columns |
| `BlockScrollySlides` | Scrollytelling with animation |
| `BlockPartners` | Partner logos, background `accentColor` |
| `BlockCarouselCities` | City showcase with Swiper.js |
| `BlockSliderImages` | Image slider |
| `BlockListingAuto` | Auto-generated content listings |
| `BlockNewsletter` | Newsletter signup (Mailchimp) |

---

## Forms

- Input padding: `10px 20px`
- Border: `1px solid var(--bc-semantic-border)`
- Focus: brand colour ring
- Submit: `button--brand` styling
- Error text: `var(--bc-semantic-error)` / `#f55200`
- Success text: `var(--bc-semantic-success)` / `#03ab3d`

Newsletter fields: first name, last name, email, organisation, job title

---

## Typography Scale

| Token | Base size | At 780px | At 1600px |
|---|---|---|---|
| `titleLarge` | 4rem | — | 5.25rem |
| `titleMedium` | 2.125rem | — | 2.875rem |
| `titleSmall` | 1.25rem | 1.5rem | 2.125rem |
| `titleSub` | 1.125rem | 1.375rem | 1.625rem |
| `body` | 1rem | 1.125rem | 1.25rem |
| `bodySmall` | 1rem | — | 1.125rem |
| `bodySmaller` | 0.875rem | — | 1rem |
| `caption` | 0.938rem | — | 1.125rem |

All responsive shifts are done via `@media` breakpoints (not `clamp()`), except container padding which uses `clamp()`.

---

## Icons

- All icons are custom SVGs — no third-party icon library
- Icon button size: `55×55px`
- Carousel nav buttons: `50px`
- External link icon: `32×19px`
- Stroke colours inherit from context (white on dark, brand on light)

---

## Code Connect Mapping

Once a Figma library is created, run the following to register Code Connect mappings via Figma MCP:

```
Component: NavigationMain → figma node: [to be assigned after Figma library creation]
Component: Button/Brand   → figma node: [to be assigned]
Component: Button/Arrow   → figma node: [to be assigned]
Component: Card           → figma node: [to be assigned]
Component: BlockImageText → figma node: [to be assigned]
```

Update this file with node IDs after the Figma library is built.
