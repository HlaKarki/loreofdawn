# /Lores Page Hero Section - Implementation Plan

## Overview

Build a minimalist, text-focused hero lore discovery page at `/lores` with:

- **Hybrid approach**: Prominent search bar + featured hero lores
- **Preview style**: Tagline + tale excerpt (future: trivia from #Trivia sections)
- **Visual aesthetic**: Minimalist & text-focused, clean typography
- **Architecture**: Designed for future discovery mechanic (blurred/locked heroes) but NOT implemented yet

---

## Design Philosophy

**Minimalist & Text-Focused:**

- Clean typography using Quicksand font (already in layout)
- Generous whitespace and breathing room
- Lore text as the star - images support but don't dominate
- Subtle interactions over flashy animations
- OKLCH color scheme with amber accents for highlights

**Page Structure:**

- **Top (40%)**: Prominent search section with large input + role filters
- **Bottom (60%)**: Featured lores section with curated hero cards
- When searching/filtering: Replace featured section with search results grid

---

## Component Architecture

```
/lores/page.tsx (Server Component)
└── LoresPageClient (Client Component)
    ├── LoreSearchHero (Search + Quick Filters)
    ├── FeaturedLoresSection
    │   ├── LoreOfTheDay (1 large featured card)
    │   └── LoreGrid (4-6 medium hero cards)
    └── AllLoresGrid (Search Results when filtering)
```

---

## Implementation Details

### 1. Server Page Component

**File:** `apps/web/src/app/(pages)/lores/page.tsx`

```typescript
export default async function LoresPage() {
  const response = await fetch(
    makeUrl("/v1/heroes?limit=500&include=meta&rank=overall")
  );
  const heroes = await response.json() as ConsolidatedHeroOptional[];
  return <LoresPageClient heroes={heroes} />;
}
```

**Pattern:** Follow `wiki/page.tsx` server component pattern

---

### 2. Client Wrapper

**File:** `apps/web/src/app/(pages)/lores/_components/lores-page-client.tsx`

**State Management:**

```typescript
type LoreFilters = {
	search: string;
	roles: string[];
};
```

**Filtering Logic:**

1. Fuse.js fuzzy search on hero name (threshold: 0.3)
2. Role filtering (AND logic)
3. Filter heroes with substantive lore (tale length > 50 chars)

**Conditional Rendering:**

- If search/filters active: Show `AllLoresGrid`
- Else: Show `FeaturedLoresSection`

---

### 3. Search Hero Section

**File:** `apps/web/src/app/(pages)/lores/_components/lore-search-hero.tsx`

**Layout:**

```
┌────────────────────────────────────────┐
│  Discover Hero Stories & Legends       │  <- H1 (text-4xl md:text-5xl)
│  Explore the tales of 100+ heroes      │  <- Subtitle (text-lg muted)
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🔍 Search hero lores...          │ │  <- Large input (h-14)
│  └──────────────────────────────────┘ │
│                                        │
│  [Fighter] [Mage] [Assassin] ...      │  <- Role badges (toggleable)
└────────────────────────────────────────┘
```

**Visual Treatment:**

- Background: `bg-gradient-to-b from-background via-background to-muted/20`
- Border: `border-b border-border/50`
- Padding: `py-8 md:py-12`

**Search Input:**

- Height: `h-14` (larger than standard)
- Placeholder: "Search hero lores..."
- Icon: SearchIcon on left
- Focus ring with amber accent

---

### 4. Featured Lores Section

**File:** `apps/web/src/app/(pages)/lores/_components/featured-lores-section.tsx`

**Structure:**

- Lore of the Day (large featured card)
- Grid of 4-6 hero cards (role-diverse selection)

**Featured Selection Algorithm:**

```typescript
// Select 1-2 heroes per role for diversity
// Prioritize heroes with substantive lore (tale.length > 100)
// Use deterministic rotation (similar to getHeroOfTheDay pattern)
// Exclude Lore of the Day from grid
```

---

### 5. Lore of the Day Component

**File:** `apps/web/src/app/(pages)/lores/_components/lore-of-the-day.tsx`

**Layout:**

```
┌────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────┐   │
│  │          │  │  HERO NAME        │   │
│  │  Image   │  │  "Tagline..."     │   │  2-col desktop
│  │  (40%)   │  │  Tale excerpt...  │   │  stacked mobile
│  │          │  │  (150-200 chars)  │   │
│  └──────────┘  │  [Read Full Lore] │   │
│                └──────────────────┘   │
└────────────────────────────────────────┘
```

**Visual Specs:**

- Border: `border-2 border-amber-500`
- Image: `painting` with gradient overlay, 40% width desktop
- Typography:
  - Name: `text-3xl font-bold`
  - Tagline: `text-base italic text-muted-foreground`
  - Tale: `text-sm leading-relaxed` (150-200 char excerpt)
- Padding: `p-6 md:p-8`

---

### 6. Lore Card Component

**File:** `apps/web/src/app/(pages)/lores/_components/lore-card.tsx`

**Layout:**

```
┌─────────────────────┐
│  ┌───────────────┐  │  <- Small image (h-32)
│  │   Image       │  │
│  └───────────────┘  │
│  HERO NAME          │  <- text-xl font-semibold
│  "Tagline"          │  <- text-sm italic, line-clamp-2
│  Tale excerpt...    │  <- text-sm, line-clamp-3
│  [Read More]        │  <- Link to /wiki/[hero]
└─────────────────────┘
```

**Visual Specs:**

- Card: `border rounded-lg hover:border-amber-400 transition-colors`
- Image: `h-32` with gradient overlay
- Spacing: `p-4`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`

**Future Discovery Support:**

```typescript
type LoreCardProps = {
	hero: ConsolidatedHeroOptional;
	isLocked?: boolean; // Future: discovery state
	onUnlock?: () => void; // Future: unlock callback
};
// Architecture supports conditional rendering for locked state
```

---

### 7. All Lores Grid

**File:** `apps/web/src/app/(pages)/lores/_components/all-lores-grid.tsx`

**Behavior:**

- Shows when search query OR role filters active
- Grid of `LoreCard` components
- Empty state when no results

**Empty State:**

- Icon + "No lores found" message
- "Try different search terms" hint

---

## Typography & Styling

### Font Stack

- **Primary:** Quicksand (already loaded in layout.tsx)
- Usage: All text on /lores page

### Text Hierarchy

- Page title: `text-4xl md:text-5xl font-bold tracking-tight`
- Section headers: `text-2xl md:text-3xl font-semibold`
- Hero names (large): `text-3xl font-bold`
- Hero names (cards): `text-xl font-semibold`
- Taglines: `text-sm md:text-base italic text-muted-foreground`
- Lore excerpts: `text-sm leading-relaxed text-foreground/90`

### Colors

- Accent: Amber for highlights, CTAs (`border-amber-500`, `text-amber-600`)
- Text: `text-foreground`, `text-muted-foreground`, `text-foreground/80`

### Spacing

- Between sections: `gap-6 md:gap-8`
- Card grids: `gap-4`
- Internal card spacing: `space-y-3`

---

## Responsive Design

**Container:**

- Max width: `max-w-7xl`
- Padding: `px-4 sm:px-6 lg:px-8`
- Vertical: `py-8 md:py-12`

**Breakpoints:**

- **Mobile (< 640px):** 1 column, stacked layouts
- **Tablet (640-1024px):** 2 columns
- **Desktop (1024px+):** 3 columns

---

## Data Fetching

**Initial Load:**

- Endpoint: `/v1/heroes?limit=500&include=meta&rank=overall`
- Returns: `ConsolidatedHeroOptional[]` with profile data
- Available: name, url_name, tagline, tale, images, roles, speciality

**Full Lore:**

- When: User clicks "Read Full Lore" / "Read More"
- How: Navigate to `/wiki/[hero]` page
- No upfront fetching of full wikis (reduces payload)

**Future Trivia:**

- Parse markdown `#Trivia` sections on-demand
- Show in modal/drawer
- Not implemented in v1

---

## Implementation Sequence

### Phase 1: Core Structure (30 min)

1. Modify `page.tsx` - server data fetching
2. Create `lores-page-client.tsx` - state management + layout

### Phase 2: Search Section (20 min)

3. Create `lore-search-hero.tsx` - title, search input, role filters

### Phase 3: Featured Section (45 min)

4. Create `featured-lores-section.tsx` - layout + selection logic
5. Create `lore-of-the-day.tsx` - large featured card
6. Create `lore-card.tsx` - compact card component

### Phase 4: Search Results (15 min)

7. Create `all-lores-grid.tsx` - search results grid + empty state

### Phase 5: Polish (30 min)

8. Typography refinement, dark mode testing
9. Responsive testing (mobile/tablet/desktop)
10. Accessibility (ARIA labels, keyboard nav)

**Total Time:** 2-3 hours

---

## Critical Files to Reference

**Must read before implementation:**

1. `/Users/hlahtun/Developer/loreofdawn/apps/web/src/app/(pages)/wiki/page.tsx`
   - Server component data fetching pattern

2. `/Users/hlahtun/Developer/loreofdawn/apps/web/src/app/(pages)/wiki/_components/wiki-page-client.tsx`
   - Client wrapper with state management

3. `/Users/hlahtun/Developer/loreofdawn/apps/web/src/app/(pages)/wiki/_components/filter-toolbar.tsx`
   - Fuse.js search + role filtering logic

4. `/Users/hlahtun/Developer/loreofdawn/apps/web/src/app/(pages)/wiki/_components/hero-of-the-day.tsx`
   - Large featured card design pattern

5. `/Users/hlahtun/Developer/loreofdawn/apps/web/src/app/(pages)/wiki/_lib/featured.ts`
   - `getHeroOfTheDay()` algorithm for deterministic rotation

---

## Future Enhancements (Post-v1)

### Discovery Mechanic

- Add when: After v1 launches, if users want gamification
- Implementation: Copy discovery system from `/wiki`, add `isLocked` prop
- Effort: 4-6 hours

### Trivia "Did You Know?"

- Button on cards opens drawer with trivia facts
- Parse `#Trivia` section from wiki markdown
- Effort: 2-3 hours

### Advanced Sorting

- Options: Most Popular, Alphabetical, By Role, Lore Length
- Add sort dropdown to search section
- Effort: 1-2 hours

---

## Quality Standards

**TypeScript:**

- No `any` types
- Proper interfaces from `@repo/database`
- Optional chaining for nested properties

**React:**

- `useMemo` for expensive computations
- `useCallback` for event handlers
- Client components marked with `"use client"`

**Styling:**

- Tailwind CSS only
- Use `cn()` for conditional classes
- Semantic color variables

**Accessibility:**

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states

---

## Risk Mitigation

**Issue: Lore excerpts too short/long**

- Solution: Test with variety of heroes, adjust character limits
- Fallback: Show tagline if tale is too short

**Issue: Some heroes have no lore**

- Solution: Filter out heroes with `tale.length < 50`

**Issue: Search performance**

- Solution: Fuse.js handles 100+ heroes well
- Backup: Add debouncing if needed

**Issue: Images don't load**

- Solution: Use existing `resolveImageSrc()` pattern with fallbacks

---

## File Structure

```
apps/web/src/app/(pages)/lores/
├── page.tsx (MODIFY)
├── layout.tsx (EXISTS)
└── _components/
    ├── lores-page-client.tsx (NEW)
    ├── lore-search-hero.tsx (NEW)
    ├── featured-lores-section.tsx (NEW)
    ├── lore-of-the-day.tsx (NEW)
    ├── lore-card.tsx (NEW)
    └── all-lores-grid.tsx (NEW)
```

Optional utility:

```
apps/web/src/app/(pages)/lores/_lib/
└── featured.ts (NEW - selection logic)
```
