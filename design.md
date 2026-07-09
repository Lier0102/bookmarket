# design.md

# BookMarket Design System

## Goal

Create a premium online bookstore.

The experience should feel closer to Apple, Linear, Raycast, MotionSites, and modern luxury editorial websites than traditional ecommerce sites.

The UI must feel:

* calm
* premium
* cinematic
* elegant
* spacious
* highly readable

Avoid looking like Bootstrap, Material UI, or an admin template.

---

# Design Philosophy

Every page must feel like it belongs to the same product.

Consistency is more important than visual complexity.

Use whitespace before decorations.

Motion should feel natural instead of flashy.

Books are the primary visual focus.

---

# Visual Identity

Keywords

* Glassmorphism
* Cinematic
* Editorial
* Luxury
* Soft Blur
* Large Typography
* Thin Borders
* Floating Layout
* Minimal Noise
* High Contrast

---

# Color Palette

Background

```
#09090B
```

Surface

```
rgba(255,255,255,.04)
```

Glass

```
rgba(255,255,255,.02)
```

Primary

```
#FFFFFF
```

Secondary

```
rgba(255,255,255,.7)
```

Border

```
rgba(255,255,255,.12)
```

Accent

```
#D6B370
```

Danger

```
#EF4444
```

Success

```
#22C55E
```

Never use saturated colors except for CTA.

---

# Typography

Primary font

```
Instrument Serif
```

Used for

* Hero
* Book titles
* Section titles

Body font

```
Inter
```

or

```
system-ui
```

Never use bold everywhere.

Prefer

300

400

500

600

instead of

700+

---

# Layout

Desktop container

```
max-width: 1440px
```

Content width

```
1200px
```

Section spacing

```
120~180px
```

Card spacing

```
32px
```

Never create crowded layouts.

---

# Border Radius

Cards

```
24px
```

Buttons

```
999px
```

Inputs

```
999px
```

Image cards

```
28px
```

---

# Shadows

Very subtle.

```
0 8px 32px rgba(0,0,0,.18)
```

Never use hard shadows.

---

# Glass Material

Every floating component should use the same glass style.

Examples

* Navbar
* Search
* Hero Badge
* Filter
* Category
* Login
* Cart Summary
* Checkout
* User Menu
* Modal

Use one reusable

```
.glass
```

class.

---

# Motion System

Animations should never attract attention.

Everything should feel smooth.

Duration

```
150ms
250ms
400ms
700ms
```

Easing

```
cubic-bezier(.4,0,.2,1)
```

Never use bounce animations.

---

# Hero Section

Inspired by MotionSites.

Requirements

* fullscreen
* cinematic
* looping background
* glass navbar
* floating badge
* large editorial heading
* subtle parallax
* smooth fade transitions

Hero is the emotional entry point.

---

# Navbar

Floating.

Glass.

Rounded.

Transparent.

Scroll behavior

Top

```
transparent
```

Scrolled

```
glass
+ blur
```

---

# Buttons

Primary

White background.

Black text.

Rounded pill.

Hover

Slight scale

```
1.02
```

Secondary

Transparent glass.

Border only.

---

# Cards

Every card should float above the background.

Use

* glass
* soft border
* blur
* large radius

Never use flat gray boxes.

---

# Book Cards

The book cover is the visual focus.

Hierarchy

Cover

↓

Title

↓

Author

↓

Price

↓

CTA

Hover

* lift
* shadow
* slight scale

---

# Product Page

Large cover image.

Sticky purchase card.

Floating purchase section.

Recommended books below.

---

# Search

Large rounded search.

Glass.

Instant filtering.

Smooth animations.

---

# Cart

Floating summary card.

Sticky checkout.

Animated quantity controls.

---

# Checkout

Three-step experience.

Shipping

↓

Review

↓

Complete

Avoid long forms.

---

# Dashboard

Unlike the public pages.

Cleaner.

Less cinematic.

Still use the same glass language.

Large tables.

Large spacing.

Charts use muted colors.

---

# Footer

Minimal.

Dark.

Thin separators.

Large spacing.

---

# Icons

Lucide React only.

Stroke width

```
1.75
```

Never mix icon libraries.

---

# Images

Large.

Rounded.

High quality.

Prefer photography.

Avoid illustrations.

---

# Responsive

Desktop first.

Tablet

↓

Mobile

Navigation becomes drawer.

Cards become stacked.

Typography scales fluidly.

---

# Accessibility

Minimum contrast AA.

Focusable elements.

Visible keyboard focus.

Respect prefers-reduced-motion.

---

# Component Rules

Every reusable UI must become a component.

Examples

* Button
* GlassPanel
* Card
* SearchBar
* HeroBadge
* BookCard
* Navbar
* Footer
* Modal
* Input
* Pagination

Never duplicate component code.

---

# Overall Feeling

Imagine if

Apple

*

Notion

*

Linear

*

MotionSites

*

an independent luxury bookstore

built this product.

The experience should prioritize calmness, elegance, readability, and premium interactions over visual effects.
