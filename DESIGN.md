# Design System: Our Story Timeline (L'Amour Éternel)

## Mode
- **Public Timeline Surface**: **Experience** — The visitor is receiving a deeply personal gift; the interface recedes to let their shared memories, emotions, and photographs take center stage.
- **Admin Management Surface**: **Operate** — Intuitive, efficient, error-resilient memory curation with zero friction.

## Color Palette & Semantic Tokens
- **Canvas / Page Background**:
  - Main: `#FAF7F2` (Warm Ivory Cream)
  - Subdued / Card Surface: `#FFFFFF` with glass tint `#FDFCF9`
  - Deep Ambiance: `#F4EFE6`
- **Primary Romantic Accent (Rose & Terracotta)**:
  - Base: `#C05665` (Vintage Rose)
  - Dark / Focus: `#9A3B4C` (Deep Rose)
  - Light Accent: `#F8E9EB` (Blush Mist)
- **Deep Emotional Anchor (Burgundy & Wine)**:
  - Base: `#682535` (Velvet Burgundy)
  - Midnight: `#3A131E` (Plum Noir)
- **Precious Accents (Champagne & Soft Gold)**:
  - Accent Gold: `#C89B53` (Warm Champagne Gold)
  - Soft Gold Highlight: `#EEDBBD`
- **Text & Contrast System**:
  - Primary Text: `#281C22` (Plum Charcoal, Contrast > 11:1 against cream canvas)
  - Secondary Text: `#5F4F57` (Warm Dusty Plum, Contrast > 5.5:1)
  - Muted / Caption: `#8B7B83` (Rose Grey, Contrast > 4.5:1)
- **Border & Glass Rings**:
  - Card Border: `rgba(200, 155, 83, 0.16)`
  - Active Glow: `rgba(192, 86, 101, 0.25)`

## Typography Hierarchy
- **Editorial / Romance Display**: Cormorant Garamond & Playfair Display (`font-serif`)
  - Hero Title: `text-4xl sm:text-6xl font-serif tracking-tight font-normal`
  - Memory Card Headings: `text-2xl sm:text-3xl font-serif font-medium`
  - Quotes: `font-serif italic text-lg sm:text-xl`
- **Interface & Reading Body**: Plus Jakarta Sans (`font-sans`)
  - Body Narrative: `text-sm sm:text-base leading-relaxed text-[#5F4F57]` (60-70ch line measure)
  - UI Labels, Badges & Dates: `text-xs uppercase tracking-wider font-semibold`

## Spatial Rhythm & Responsive Timeline
- **Desktop (>= 768px)**:
  - Central golden thread with glowing circular milestone nodes
  - Cards alternate Left and Right with subtle curved branch connectors
  - Cards span 45% of container width with generous staggered vertical breathing room
- **Mobile (< 768px)**:
  - Golden timeline hugs the left side (`left-6 sm:left-8`)
  - Glowing nodes indicate chronological milestones
  - Cards stack cleanly with full mobile width and touch-friendly targets

## Craft Polish Details
- Custom selection colors: blush rose highlight (`::selection { background: #F8E9EB; color: #682535; }`)
- Custom scrollbar: slim champagne track with warm rose thumb
- Lightbox modal: smooth backdrop blur, keyboard ESC dismissal, navigation, and photo captions
- Built-in audio: Synthesized lo-fi warm romantic piano chord progression using HTML5 Web Audio API (instant, never fails with 404s or network lag)
