# Dataset Search Engine — Design Philosophy

## Chosen Design Approach: Glassmorphic Minimalism

**Design Movement:** Contemporary glassmorphism with minimalist principles, drawing from modern SaaS design and high-end data visualization interfaces.

**Core Principles:**
1. **Clarity through transparency** — Glass layers reveal content depth while maintaining visual hierarchy
2. **Negative space as structure** — Whitespace and breathing room guide the eye to critical elements
3. **Bold typography hierarchy** — Dramatic size contrasts between headings and body text create visual impact
4. **Micro-interactions matter** — Smooth transitions, hover states, and focus rings reward interaction

**Color Philosophy:**
- **Primary Dark Base:** `oklch(0.141 0.005 285.823)` — deep charcoal with blue undertones, sophisticated and non-fatiguing
- **Glass Surfaces:** `oklch(0.21 0.006 285.885)` with `backdrop-blur-xl` and `bg-white/5` — frosted glass effect
- **Accent Cyan:** `oklch(0.65 0.18 200)` — electric cyan for CTAs, search focus, and data highlights
- **Muted Neutrals:** `oklch(0.274 0.006 286.033)` for secondary elements, maintaining hierarchy
- **Emotional intent:** Premium, trustworthy, modern—suitable for data professionals and researchers

**Layout Paradigm:**
- **Asymmetric hero:** Search bar positioned off-center with featured categories in a staggered grid
- **Card-based results:** Glassmorphic cards with subtle shadows and hover lift effects
- **Vertical rhythm:** Generous padding (6rem+ between sections) creates breathing room
- **Responsive grid:** 1 column mobile → 2 columns tablet → 3 columns desktop

**Signature Elements:**
1. **Glassmorphic cards:** Frosted glass effect with border and backdrop blur (signature visual motif)
2. **Cyan accent line:** Thin horizontal dividers and focus indicators in bright cyan
3. **Bold sans-serif headings:** Paired with refined body text for contrast

**Interaction Philosophy:**
- **Hover lift:** Cards and buttons scale subtly (1.02) with shadow depth increase
- **Focus rings:** Cyan accent outlines on interactive elements
- **Smooth transitions:** All state changes use 200–300ms ease-out timing
- **Loading states:** Subtle shimmer animations in glass cards

**Animation Guidelines:**
- **Entrance:** Cards fade in + slide up (opacity 0→1, translateY 20px→0) over 300ms
- **Hover:** Scale 1→1.02, shadow depth increase, backdrop blur intensifies
- **Focus:** Cyan ring appears with 150ms ease-out
- **Transitions:** All use `cubic-bezier(0.23, 1, 0.32, 1)` (snappy ease-out)

**Typography System:**
- **Display:** `Sora` (bold, 3.5rem–4.5rem) — headlines, hero title
- **Heading:** `Sora` (semibold, 1.875rem–2.25rem) — section titles
- **Body:** `Inter` (regular, 1rem) — descriptions, metadata
- **Caption:** `Inter` (regular, 0.875rem) — secondary info, timestamps
- **Hierarchy rule:** Headings always 2–3 weight steps heavier than body

**Brand Essence:**
*The fastest way to find the data you need, wrapped in a premium experience.*
**Personality:** Intelligent, modern, trustworthy, precise

**Brand Voice:**
- Headlines are direct and benefit-driven: "Find datasets in seconds" instead of "Welcome to our search"
- CTAs are action-oriented: "Explore Dataset" not "Click Here"
- Microcopy is helpful and conversational: "No results yet—try adjusting your filters"

**Signature Brand Color:** Cyan (`oklch(0.65 0.18 200)`) — unmistakably modern and data-forward

**Logo Concept:** A minimalist magnifying glass with a cyan accent line forming a subtle "data wave" inside the lens—bold, geometric, no text.

---

## Implementation Notes

- **CSS Variables:** All colors use OKLCH format in `index.css` for consistency
- **Glass Effect Recipe:** `bg-white/5 backdrop-blur-xl border border-white/10`
- **Spacing Scale:** 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 6rem (based on Tailwind defaults)
- **Shadow Depth:** Use `shadow-lg` for cards, `shadow-xl` on hover
- **Border Radius:** `rounded-lg` (0.65rem) for cards, `rounded-full` for buttons
