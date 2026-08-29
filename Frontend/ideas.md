# Vaayu Dashboard — Design Direction

## Stylistic Approaches

### Theme Name: Monsoon Ledger
Very light editorial dashboard with deep ink, oxidized green, and a single warm saffron signal color. It should feel like a calm climate-control room: data is serious, but the interface is humane and tactile.

**Probability:** 0.07

### Theme Name: Quiet Orbit
A dark observatory interface with graphite surfaces, misty cyan, and amber alerts. The dashboard reads like a night-shift monitoring station with soft halos and deliberate information density.

**Probability:** 0.03

### Theme Name: Field Notes
A warm paper-and-ink system inspired by field notebooks, transit maps, and environmental survey marks. Color is used sparingly, with hand-drawn annotation details around otherwise structured data.

**Probability:** 0.08

## Chosen Approach: Monsoon Ledger

### Design Movement
Contemporary editorial modernism with cues from Swiss information design and Indian monsoon-season materiality: precise grids, generous margins, muted mineral colors, and small moments of saffron warmth.

### Core Principles
1. **Calm clarity:** air-quality information should be understandable within one glance, with a clear hierarchy between health status, movement, and action.
2. **Editorial rhythm:** use asymmetrical compositions, strong section titles, small metadata lines, and oversized numerals rather than generic card stacks.
3. **Material warmth:** pair an off-white canvas with paper-like noise, fine rules, soft shadows, and earthy accents so the interface feels grounded.
4. **Signal restraint:** reserve saffron for the active state, current location, and primary actions; never use it as a decorative gradient.

### Color Philosophy
The background is a warm cloud-white rather than pure white, giving the page the feeling of daylight reflected through monsoon haze. Deep ink provides authority and readable contrast. Oxidized green marks healthy air and continuity. Saffron is the ownable signal color: it adds optimism and immediacy without turning the product into a warning screen.

### Layout Paradigm
Use a persistent left rail and an editorial main stage. The top of the main stage is a compact status strip with one dominant live AQI reading, followed by an offset two-column data field. Charts sit in wide, low modules with labels aligned like a publication margin; the right column is reserved for the next useful action, not a duplicate metric grid.

### Signature Elements
- A thin saffron location marker that behaves like an editorial underline.
- Tinted metric panels with oversized numerals and small uppercase metadata labels.
- A fine dotted air-flow texture in the background, used only around the live-status area.

### Interaction Philosophy
Interactions should feel like turning a page or changing a field note: immediate, quiet, and legible. Selection changes use color and a short underline before any motion. Buttons confirm with a compact press response, and non-critical controls reveal context on hover without shifting layout.

### Animation
Use short 160–220ms ease-out transitions for navigation, dropdowns, and active states. Entrance motion is a small 8px upward settle with opacity, staggered across top-level data modules. The chart line can draw in once on initial load, but subsequent filter changes should crossfade rather than replay. Respect reduced-motion preferences and never animate high-frequency status numbers.

### Typography System
Use **DM Sans** for body, navigation, and data labels; use **Cormorant Garamond** for large editorial page titles and section callouts. Display titles are 48–64px with compact line-height, metric numerals are 42–72px with tabular numerals, and metadata is 10–11px uppercase with generous tracking. Never use Inter.

### Brand Essence
**Vaayu is a calm, multilingual air intelligence dashboard for people who need to make better everyday decisions from environmental data.**

Personality: **grounded, observant, reassuring**.

### Brand Voice
Headlines are direct and quietly confident. CTAs sound like helpful instructions, not sales copy. Microcopy uses short phrases and avoids technical jargon unless it adds clarity.

Example lines:
- “The air is settling. Keep the afternoon open.”
- “Read the next shift before it arrives.”

### Wordmark & Logo
Use a bold, text-free symbol: three stacked wind ribbons forming a compact V, with the lowest ribbon slightly offset like a breath leaving the body. The mark should be readable at 24px, work in deep ink or saffron, and appear in the app rail as well as the favicon.

### Signature Brand Color
**Vaayu Saffron — #E1A43A.** It is warm, recognizable, and reserved for meaningful signals: the active location, live indicator, and primary action.

## Implementation Reminder
All page and component files should keep a short comment referencing the Monsoon Ledger system, the warm cloud-white canvas, deep ink, oxidized green, saffron signal, DM Sans + Cormorant Garamond, and the dashboard-first entry rule.
