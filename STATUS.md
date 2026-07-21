# Bark Prototype — status

Real **Next.js 16 + React 19 + Tailwind v4 + shadcn/ui** app. Built and tested while you were out.

## Run it
```bash
cd "/Users/rodrigomartinezmedina/CODE/BARK"
npm run dev        # http://localhost:3000
```
(The dev server may already be running from this session at http://localhost:3000.)

## What works (all tested in-browser)
- **Two searchable categories** via the search dropdown: **Personal Trainers** and **Gardeners**. Switching swaps the data, the hero title, the count, and the category-specific filters (Training goals ↔ Services).
- **Universal filters** all actually filter: Price brackets, Rating (4+/4.5+), Response time, Distance.
- **Category-specific filters**: Training goals / Services checkboxes.
- **Live result count** ("8 personal trainers…" → "5 of 8 match your filters").
- **Active filter chips**, each removable, plus Clear all.
- **Cards**: avatar, verified, rating / "No reviews yet" / "New on Bark", Top Match, trust signals, specialties, 2-line bio + See more, and the **improved "Why this match"** (expand → specific matched reasons with checks, per-professional).
- **Dismissible banner**.
- **Empty state** with a Clear-filters recovery when no one matches.

## Data
`src/data/professionals.json` — 8 personal trainers + 7 gardeners, varied names, ratings, years, prices, descriptions, and per-pro "why this match" reasons. Add more pros or a new category by editing this file (add a category to `categories` and pros with that `category` id).

## Structure
- `src/app/page.tsx` — search, filters, results, chips, empty state (all client-side).
- `src/components/pro-card.tsx` — the card with expandable Why-this-match + See more.
- `src/lib/types.ts` — types.
- `src/components/ui/*` — shadcn components (button, badge, checkbox, card, etc.).

## Not done / next
- Deploy for a shareable link: `npx vercel` in this folder (you know the flow).
- Colours are inline Bark blue (`#2d7af1`) etc. for exact match; could be moved to shadcn theme tokens.
- Mobile layout is basic (sidebar stacks); desktop is the polished view.
- Old single-file prototype kept in `_reference/index.html`.
