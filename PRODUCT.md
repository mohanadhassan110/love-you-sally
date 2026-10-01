# Product Context: Our Story Timeline (NFC Digital Memory Gift)

## Overview
A sentimental, romantic digital memory gift application accessed via a physical NFC tag/card (e.g., inside an anniversary card, acrylic keepsake, keychain, or engraved wood/metal card). When tapped with a smartphone, it unlocks a beautifully crafted digital journey celebrating the couple's relationship timeline.

## Value Proposition
- **For the Partner (Recipient)**: An enchanting, intimate mobile-first experience that feels like opening a personal museum of their love. Features a live relationship day counter, romantic quotes, ambient sound/music toggle, and high-resolution photo milestone cards with expandable stories and heart reactions.
- **For the Gift Creator (Admin)**: A discreetly protected admin dashboard (PIN secured) to add, edit, rearrange, and manage memories with client-side image compression, photo preview, tags, milestone badges, and instant timeline sync.

## Target Experience & Devices
- **Primary**: Mobile smartphones (iOS Safari & Android Chrome) tapped directly via NFC.
- **Secondary**: Tablet & Desktop viewing for sharing moments together on a larger screen.

## Core Capabilities
1. **Romantic Hero Experience**:
   - Personalized names (e.g., "Julian & Clara's Universe")
   - Live relationship counter (days, hours, minutes, seconds together)
   - Ambient romantic music toggle (synthesized lo-fi warm romantic piano chords using Web Audio API — reliable anywhere with zero external dependencies)
   - Interactive floating love petals / sparkles particles
2. **Vertical Interactive Timeline**:
   - Alternating left/right milestone cards on desktop, seamless elegant left-aligned flow on mobile
   - Large photo presentation with 4:3 / 16:9 aspect-ratio protection, zoom on hover, and full-screen Lightbox with metadata
   - Milestone badges (01, 02... with icons), date tags, location, and emotional story text with expandable "Read full story"
   - Love note & heart reaction system with joyful floating hearts
3. **Discreet Admin Dashboard (`/admin` or hidden key icon)**:
   - Protected by customizable PIN (default: `1314` - "forever and always")
   - Add new memory with live image upload (automatic compression to local storage data URL) or direct photo URL
   - Edit memory modal (title, date, location, story, milestone badge, image)
   - Delete with confirmation
   - Couple profile settings: names, relationship start date, hero quote, custom PIN
   - Data management: export JSON, import JSON, reset to romantic sample data
4. **Data Persistence**:
   - High-capacity LocalStorage with automatic fallback and sample data seeding
   - Architecture prepared with clean repository/service abstraction for immediate plug-and-play connection to Supabase / Firebase / REST backend.
