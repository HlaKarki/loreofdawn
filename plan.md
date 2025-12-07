# Heroes Gallery Page Design Plan

## Executive Summary

This plan outlines the design and implementation of a unified Heroes Gallery page at `/heroes` that replaces the current basic `/wiki` and
`/hero` index pages. The new gallery will provide a rich, visual browsing experience that balances hero lore appeal with quick access to
performance stats.

## Current State Analysis

### Existing Pages

- **`/wiki/page.tsx`**: Basic grid of hero names linking to wiki pages
- **`/hero/page.tsx`**: Nearly identical grid linking to stats pages
- Both are minimal with no images, no metadata, no filtering

### Available Design System

From the landing page components:

- **Card-based layouts** with gradients and overlays
- **TopThree component**: Rich hero cards with images, roles, stats (WR/PR/BR)
- **StatsByRoles**: Role-based filtering and visualization patterns
- **HeroSearch**: Fuse.js-powered search with keyboard navigation
- **Badge components** for roles and status
- **Color palette**: `--color-chart-1` (green/win), `--color-chart-3` (blue/pick), `--color-chart-5` (red/ban)
- **Responsive grids**: 1 col mobile, 2 col tablet (sm:), 3 col desktop (md:)
- **Shadcn/ui components**: Card, Badge, Button, Input, Popover, ScrollArea

### Available Data

From API endpoints and types:

- **`MlHeroList`**: id, display_name, url_name, updatedAt
- **`MlHeroProfile`**: images (painting, squarehead_big, head_big), roles, lanes, difficulty, speciality, tagline
- **`MlMetaSummary`**: win_rate, pick_rate, ban_rate
- **API Endpoint**: `/v1/heroes?limit=N&filter.roles=X&sort=-win_rate&include=meta`

## Design Specification

### Page Structure

```
/heroes (new unified gallery)
├── Header Section
│   ├── Title: "Heroes Gallery"
│   ├── Subtitle: "Discover heroes, explore lore, and analyze performance"
│   └── Search Bar (adapted from HeroSearch)
├── Filter Controls
│   ├── Role Filter (Fighter, Mage, Assassin, Marksman, Tank, Support)
│   ├── Sort Options (Alphabetical, Win Rate, Pick Rate, Ban Rate)
│   └── Clear Filters Button
└── Hero Grid
    └── HeroCard (x N heroes)
        ├── Hero Image (painting or squarehead_big)
        ├── Gradient Overlay
        ├── Hero Name
        ├── Role Badges
        ├── Stats Mini-Display (WR/PR/BR)
        └── Dual Action Buttons
            ├── "View Lore" → /wiki/[hero]
            └── "View Stats" → /hero/[hero]
```

### Hero Card Design

**Visual Hierarchy**:

```
┌─────────────────────────────┐
│   [Hero Image with gradient]│  ← 240px height, object-cover
│                             │
│   [Hero Name]               │  ← Absolute positioned, bottom
└─────────────────────────────┘
┌─────────────────────────────┐
│ [Role Badges]               │  ← Flex wrap
│                             │
│ WR: 52.3%  PR: 8.5%  BR: 3% │  ← Grid 3 cols, muted text
│                             │
│ [View Lore] [View Stats]    │  ← Button group
└─────────────────────────────┘
```

**Specifications**:

- **Image**:
  - Resolution priority: `painting` > `squarehead_big` > `head_big`
  - Height: 240px (h-60)
  - Object fit: cover, object-top
  - Gradient overlay: `bg-gradient-to-t from-background/95 to-transparent`

- **Hero Name**:
  - Position: absolute, bottom-4 left-4
  - Font: text-2xl font-bold
  - Color: foreground

- **Role Badges**:
  - Component: Badge variant="secondary"
  - Display role icon + title
  - Flex wrap, gap-2, mb-3

- **Stats Display**:
  - Grid 3 columns
  - Label: text-xs text-muted-foreground
  - Value: text-sm font-semibold
  - Color-coded: WR (green), PR (blue), BR (red)

- **Action Buttons**:
  - Two buttons in flex gap-2
  - Primary: "Lore" (BookOpen icon)
  - Secondary: "Stats" (BarChart icon)
  - Both outlined, hover effects

### Filter System

**Role Filter**:

- Horizontal scrollable badge group
- All roles from `heroRolesArray`: mage, fighter, assassin, marksman, tank
- Multi-select with visual toggle state
- Active state: primary background, inactive: muted

**Sort Dropdown**:

- Options:
  - Alphabetical (A-Z)
  - Win Rate (High to Low)
  - Pick Rate (High to Low)
  - Ban Rate (High to Low)
- Default: Alphabetical

**Implementation**: Client-side filtering + sorting on fetched data

### Search Integration

**Approach**: Adapt existing HeroSearch component

- Keep Fuse.js fuzzy search
- Instead of navigation on select, filter the grid in real-time
- Show "X heroes found" count
- Clear button to reset search

### Responsive Breakpoints

- **Mobile (< 640px)**: 1 column, stacked filters
- **Tablet (640px - 1024px)**: 2 columns, horizontal filters
- **Desktop (1024px+)**: 3 columns, all filters in one row

## Component Architecture

### New Components to Create

1.  **`/heroes/page.tsx`** (Server Component)
    - Fetch heroes data with meta: `/v1/heroes?limit=200&include=meta&rank=overall`
    - Pass data to client component

2.  **`_components/heroesGallery.tsx`** (Client Component)
    - State management: filters, search, sort
    - Grid layout rendering
    - Orchestrates HeroCard, Filters, Search

3.  **`_components/heroCard.tsx`** (Client Component)
    - Individual hero card
    - Receives: MlHeroProfile + MlMetaSummary
    - Handles image resolution, role display, stats, actions

4.  **`_components/heroFilters.tsx`** (Client Component)
    - Role filter badges
    - Sort dropdown
    - Clear filters button

5.  **`_components/heroGallerySearch.tsx`** (Client Component)
    - Adapted from HeroSearch
    - Returns filtered results instead of navigation
    - Props: heroes, onFilterChange

### Components to Reuse

- **Card, CardContent** from `@/components/ui/card`
- **Badge** from `@/components/ui/badge`
- **Button** from `@/components/ui/button`
- **Input** from `@/components/ui/input`
- **Popover** from `@/components/ui/popover` (for sort dropdown)
- **resolveImageSrc** from `/hero/_components/header.hero.tsx`
- **tidyLabel** from `@/lib/utils`

## Data Flow

```
Server (page.tsx)
  ↓ fetch /v1/heroes?limit=200&include=meta
  ↓ ConsolidatedHeroOptional[]
Client (heroesGallery.tsx)
  ↓ useState(heroes)
  ↓ useState(filters: { roles: [], search: '', sort: 'alpha' })
  ↓ useMemo(filteredHeroes) ← apply filters + search + sort
  ↓ map(filteredHeroes → HeroCard)
```

## Implementation Steps

### Phase 1: Page Setup

1.  Create `/heroes/page.tsx` (server component)
2.  Fetch data from `/v1/heroes?limit=200&include=meta&rank=overall`
3.  Create basic layout structure
4.  Add responsive container (max-w-7xl)

### Phase 2: Hero Card Component

1.  Create `heroCard.tsx`
2.  Implement image resolution (reuse `resolveImageSrc`)
3.  Add gradient overlay and hero name
4.  Display role badges with icons
5.  Add stats grid (WR/PR/BR)
6.  Create dual action buttons (Lore + Stats)
7.  Add hover effects and transitions

### Phase 3: Filter System

1.  Create `heroFilters.tsx`
2.  Implement role filter badges (multi-select)
3.  Add sort dropdown (Alphabetical, WR, PR, BR)
4.  Create clear filters button
5.  Wire up state management

### Phase 4: Search Integration

1.  Create `heroGallerySearch.tsx`
2.  Adapt HeroSearch component
3.  Integrate Fuse.js for fuzzy search
4.  Emit filter events instead of navigation
5.  Add results count display

### Phase 5: Main Gallery Component

1.  Create `heroesGallery.tsx`
2.  Set up state management (filters, search, sort)
3.  Implement filtering logic in useMemo
4.  Implement sorting logic in useMemo
5.  Create responsive grid layout
6.  Add loading states and empty states

### Phase 6: Routing Updates

1.  Update header navigation to point to `/heroes`
2.  Consider redirects from `/wiki` and `/hero` to `/heroes`
3.  Update any internal links

### Phase 7: Polish & Optimization

1.  Add page transitions
2.  Optimize image loading (lazy load, blur placeholders)
3.  Add skeleton loading states
4.  Test keyboard navigation
5.  Test responsive design at all breakpoints
6.  Accessibility audit (ARIA labels, focus management)

## Navigation Strategy

**Header Links**:

- Update "Wikis" → "Heroes" (points to `/heroes`)
- Keep "Stats" for the stats dashboard page

**From Heroes Gallery**:

- Click "View Lore" → Navigate to `/wiki/[hero]`
- Click "View Stats" → Navigate to `/hero/[hero]?rank=overall`
- Keep existing wiki and hero detail pages unchanged

**Backwards Compatibility**:

- Keep `/wiki` and `/hero` index pages temporarily
- Add notice: "Visit our new Heroes Gallery" with link to `/heroes`
- Consider 301 redirects after transition period

## Technical Considerations

### Performance

- Fetch all heroes once (200 heroes ~= small payload)
- Client-side filtering/sorting (instant updates)
- Image lazy loading with IntersectionObserver
- Virtualization if hero count grows significantly (>500)

### State Management

- useState for filters, search, sort
- useMemo for computed filtered/sorted lists
- No external state library needed (simple state)

### SEO

- Server-side render initial hero list
- Add meta tags: title, description
- Structured data for hero gallery
- Canonical URL: `/heroes`

### Accessibility

- Keyboard navigation for filters
- ARIA labels for all interactive elements
- Focus management for search
- Screen reader announcements for filter changes

### Error Handling

- Loading state while fetching
- Error state if fetch fails
- Empty state if no heroes match filters
- Retry mechanism for failed fetches

## Design Mockup (ASCII)

```
┌────────────────────────────────────────────────────────────┐
│  Heroes Gallery                                            │
│  Discover heroes, explore lore, and analyze performance    │
│                                                            │
│  [Search heroes...]                              🔍       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Roles: [All] [Fighter] [Mage] [Assassin] [Marksman]     │
│         [Tank]                                  Sort: [▾]  │
│                                              Clear Filters │
└────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│  [Hero1] │  [Hero2] │  [Hero3] │
│  Image   │  Image   │  Image   │
│  Name    │  Name    │  Name    │
│  Roles   │  Roles   │  Roles   │
│  Stats   │  Stats   │  Stats   │
│  Actions │  Actions │  Actions │
├──────────┼──────────┼──────────┤
│  [Hero4] │  [Hero5] │  [Hero6] │
│  ...     │  ...     │  ...     │
└──────────┴──────────┴──────────┘
```

## Color Palette Reference

From existing design system:

- **Win Rate**: `var(--color-chart-1)` (green)
- **Pick Rate**: `var(--color-chart-3)` (blue)
- **Ban Rate**: `var(--color-chart-5)` (red)
- **Meta/Strong**: `var(--color-chart-1)`
- **Weak**: `var(--color-chart-5)`
- **Balanced**: `var(--color-chart-3)`

## File Structure

```
apps/web/src/app/(pages)/
└── heroes/
    ├── page.tsx (server component)
    ├── layout.tsx (optional: Quicksand font like /hero)
    └── _components/
        ├── heroesGallery.tsx (client)
        ├── heroCard.tsx (client)
        ├── heroFilters.tsx (client)
        └── heroGallerySearch.tsx (client)
```

## Dependencies

All required dependencies already available:

- `fuse.js` (for search)
- `next/image` (for optimized images)
- `next/link` (for navigation)
- `lucide-react` (for icons: BookOpen, BarChart, Search, X, etc.)
- `@/components/ui/*` (shadcn components)

No new dependencies needed!

## Success Metrics

- **User Engagement**: Increased time on page vs old index pages
- **Discovery**: More unique hero pages visited per session
- **Usability**: <3 clicks to reach any hero's lore or stats
- **Performance**: <1s load time, instant filter/search updates
- **Accessibility**: WCAG 2.1 AA compliance

## Next Steps

After implementation:

1.  Gather user feedback on design and usability
2.  A/B test variations (card layout, CTA wording)
3.  Add advanced filters (difficulty, speciality)
4.  Consider favorite/bookmark functionality
5.  Explore hero comparison feature

---

**Estimated Implementation Time**: 8-12 hours
**Complexity**: Medium
**Priority**: High (unifies fragmented navigation)
