---
name: Vĩnh Hưng Heritage CRM
colors:
  surface: '#fff8f3'
  surface-dim: '#e2d9cf'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e8'
  surface-container: '#f6ece2'
  surface-container-high: '#f0e7dc'
  surface-container-highest: '#eae1d7'
  on-surface: '#1f1b15'
  on-surface-variant: '#4f4637'
  inverse-surface: '#343029'
  inverse-on-surface: '#f9efe5'
  outline: '#817665'
  outline-variant: '#d2c5b1'
  surface-tint: '#7b5800'
  primary: '#7b5800'
  on-primary: '#ffffff'
  primary-container: '#c89a3d'
  on-primary-container: '#4b3400'
  inverse-primary: '#f1bf5e'
  secondary: '#645e51'
  on-secondary: '#ffffff'
  secondary-container: '#e9dece'
  on-secondary-container: '#696255'
  tertiary: '#355f99'
  on-tertiary: '#ffffff'
  tertiary-container: '#7ba3e1'
  on-tertiary-container: '#00386e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea6'
  primary-fixed-dim: '#f1bf5e'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5d4200'
  secondary-fixed: '#ece1d1'
  secondary-fixed-dim: '#cfc5b6'
  on-secondary-fixed: '#201b11'
  on-secondary-fixed-variant: '#4c463a'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a7c8ff'
  on-tertiary-fixed: '#001c3b'
  on-tertiary-fixed-variant: '#17477f'
  background: '#fff8f3'
  on-background: '#1f1b15'
  surface-variant: '#eae1d7'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin: 32px
  container-max: 1440px
---

## Brand & Style

This design system is built for a premium bird’s nest brand, blending traditional heritage with modern administrative efficiency. The aesthetic is **Organic Minimalism** infused with **Glassmorphism**, creating an "airy" and "breathable" interface that feels more like a luxury boutique than a rigid data tool. 

The target audience consists of boutique owners and high-end distributors who value precision, cleanliness, and a sense of calm in their workflow. The UI evokes feelings of trust, warmth, and "premium wellness" through the use of soft beige tones and subtle translucent layers.

## Colors

The palette is rooted in the natural, earthy tones of traditional bird’s nest harvesting—warm creams, sun-dried ambers, and soft stone greys.

- **Primary (#C89A3D):** A refined gold/ochre used for calls to action, active states, and brand signatures.
- **Background (#F9F5EE):** A warm, off-white "linen" base that reduces eye strain compared to pure white.
- **Glass Surface:** Used for floating containers and navigation bars, providing a semi-transparent layer that adds depth without clutter.
- **Typography:** Deep umber (#3F3A33) provides high legibility while remaining softer than pure black, while taupe (#8B8375) handles secondary metadata.

## Typography

The design system utilizes **Inter** exclusively to maintain a clean, systematic look. The type hierarchy is intentionally restrained to prevent the "over-designed" look often found in complex CRMs.

- **Strict Constraints:** Never use "Bold" (700+) or "Black" (900) weights; stick to Medium (500) for headers and Regular (400) for body text. 
- **Formatting:** Avoid All-Caps for any labels or buttons; the premium feel comes from natural sentence or title casing.
- **Spacing:** Letter spacing is slightly tightened on larger headlines for a more "editorial" feel, while body text remains standard for maximum readability in data tables.

## Layout & Spacing

This design system uses a **Fluid-Fixed Hybrid Grid**. The main content area lives within a maximum 1440px container, but sidebar and navigation elements may pin to the edges of the viewport.

- **Rhythm:** A 4px base unit ensures consistent scaling.
- **Airy Margins:** Use generous 32px external margins and 24px gutters to prevent data density from feeling overwhelming.
- **CRM Reflow:** On tablet devices, the sidebar collapses into an icon-only rail to preserve horizontal space for data tables. On mobile, all glass containers stack vertically with 16px spacing.

## Elevation & Depth

Depth is established through **Material Layering** rather than heavy shadows.

- **Layer 0 (Base):** The #F9F5EE background.
- **Layer 1 (Glass):** Cards and surfaces using the 85% opacity white with a `10px` backdrop blur. This layer uses a very soft, 4% opacity umber shadow to "lift" it from the cream base.
- **Layer 2 (Overlays):** Modals and dropdowns. These use the same glass effect but with a slightly more pronounced shadow (8% opacity) and a 1px solid border in `#E3D7C8` to define the edges.
- **Shadow Character:** Shadows should have a large blur radius (20px+) and 0 spread to appear as ambient light rather than a hard drop shadow.

## Shapes

The shape language is "Soft-Modern." It avoids the aggressive roundness of "bubble" designs while steering clear of the harshness of sharp corners.

- **Large Containers:** Cards and main content panels use a **16px** radius, echoing the organic nature of the product.
- **Interactive Elements:** Buttons and form inputs use a tighter **8px** radius to signal precision and utility.
- **Selection States:** Checkboxes and radio buttons use a 4px radius and the Primary Accent color when active.

## Components

### Buttons
- **Primary:** Background `#C89A3D`, text white, 8px radius. No drop shadow; use a subtle inner glow if depth is needed.
- **Secondary:** Transparent background with a 1px `#C89A3D` border.

### Glassmorphic Inputs
- **Field Styling:** Background `rgba(255, 255, 255, 0.85)` with a 10px backdrop blur. 
- **Border:** 1px solid `#E3D7C8`. 
- **Active State:** Border transitions to `#C89A3D` with no glow.

### Cards
- **Structure:** 16px radius, glass surface. Padding should be a minimum of 24px.
- **Header:** Use H2 (#3F3A33) for card titles, never bold.

### Data Lists & Tables
- **Rows:** Alternating subtle background tints or 1px bottom borders in `#E3D7C8`. 
- **Hover State:** A very subtle shift to a slightly lighter cream to indicate interactivity.

### Chips & Status Indicators
- Use the Warning color (#D96C3F) sparingly for "Low Stock" or "Pending Payment" alerts. 
- Use the Accent color (#C89A3D) for "Completed" or "Verified" statuses to maintain brand cohesion.