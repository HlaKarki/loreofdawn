/**
 * Enhanced Wiki Types
 * Designed for rich lore discovery and search UX
 */

import z from "zod/v3";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const STORY_MOODS_Z = z.enum([
	"tragic",
	"heroic",
	"mysterious",
	"dark",
	"comedic",
	"romantic",
	"epic",
	"melancholic",
	"triumphant",
	"vengeful",
]);

export const STORY_MOODS = [
	"tragic",
	"heroic",
	"mysterious",
	"dark",
	"comedic",
	"romantic",
	"epic",
	"melancholic",
	"triumphant",
	"vengeful",
] as const;

export const STORY_THEMES_Z = z.enum([
	"revenge",
	"redemption",
	"betrayal",
	"family",
	"power",
	"sacrifice",
	"love",
	"loss",
	"honor",
	"destiny",
	"corruption",
	"loyalty",
	"freedom",
	"justice",
]);

export const STORY_THEMES = [
	"revenge",
	"redemption",
	"betrayal",
	"family",
	"power",
	"sacrifice",
	"love",
	"loss",
	"honor",
	"destiny",
	"corruption",
	"loyalty",
	"freedom",
	"justice",
] as const;

export const STORY_ARCS_Z = z.enum([
	"origin",
	"fall_from_grace",
	"rise_to_power",
	"redemption_arc",
	"tragedy",
	"coming_of_age",
	"quest",
	"ongoing",
]);

export const STORY_ARCS = [
	"origin",
	"fall_from_grace",
	"rise_to_power",
	"redemption_arc",
	"tragedy",
	"coming_of_age",
	"quest",
	"ongoing",
] as const;

export const STORY_TYPES_Z = z.enum([
	"full_backstory",
	"side_story",
	"multi_chapter",
	"snippet",
	"ability_lore",
	"mixed",
]);

export const STORY_TYPES = [
	"full_backstory",
	"side_story",
	"multi_chapter",
	"snippet",
	"ability_lore",
	"mixed",
] as const;

export type StoryMood = (typeof STORY_MOODS)[number];
export type StoryTheme = (typeof STORY_THEMES)[number];
export type StoryArc = (typeof STORY_ARCS)[number];
export type StoryType = (typeof STORY_TYPES)[number];

// ============================================================================
// CORE WIKI METADATA
// ============================================================================

/**
 * Rich metadata for wiki content - stored in wikis.metadata JSONB column
 */
export interface WikiMetadata {
	// Content metrics
	wordCount: number;
	readingTimeMinutes: number; // Calculated from wordCount

	// Story classification
	storyType: StoryType;
	storyArc: StoryArc | null;

	// Emotional & thematic tags
	moods: StoryMood[];
	themes: StoryTheme[];

	// Hooks & teasers
	hook: string | null; // Most epic/emotional line from story
	teaser: string; // Curated compelling paragraph (150-200 chars)
	openingLine: string | null; // First line if it's good

	// Visual & style
	dominantColor: string | null; // Hex color for dynamic backgrounds
	coverImage: string | null; // Scene from story, not just hero portrait

	// Content richness flags
	hasBackstory: boolean;
	hasSideStory: boolean;
	hasAbilityLore: boolean;
	hasTrivia: boolean;
	hasChapters: boolean;
	chapterCount: number;
	chapterTitles: string[];

	// Searchable content
	plotKeywords: string[]; // ["assassination attempt", "lost love", "ancient prophecy"]
	characterTraits: string[]; // ["noble", "cunning", "tormented", "wise"]
	locations: string[]; // Places mentioned in the story

	// Quality indicators
	artworkCount: number;
	hasVoiceLines: boolean;

	// Scoring (calculated/curated)
	rarityScore: number; // 0-100: How unique/rare is this lore?
	epicnessScore: number; // 0-100: Scale of story (personal vs world-ending)
	mysteryLevel: number; // 0-100: How many unanswered questions?
	connectionsCount: number; // How many other heroes mentioned?

	// Auto-generated
	createdAt: number; // Timestamp when metadata was generated
	updatedAt: number;
}

// ============================================================================
// RELATIONSHIPS
// ============================================================================

/**
 * Hero relationships mentioned in lore - stored in wikis.relationships JSONB
 */
export interface WikiRelationships {
	// Core connections
	relatedHeroes: string[]; // Array of hero url_names
	faction: string | null; // "Moniyan Empire", "Shadow Abyss", etc.

	// Typed relationships
	allies: string[]; // Hero url_names of allies
	rivals: string[]; // Hero url_names of rivals/enemies
	family: string[]; // Hero url_names of family members
	mentors: string[]; // Hero url_names of mentors/students

	// Context
	factionRole: string | null; // "Leader", "Member", "Exile", etc.
	locationTies: {
		location: string;
		relationship: "birthplace" | "home" | "exile" | "conquered" | "visited";
	}[];
}

// ============================================================================
// ANALYTICS (Separate table - frequently updated)
// ============================================================================

/**
 * Engagement metrics - stored in wiki_analytics table
 */
export interface WikiAnalytics {
	hero: string; // Foreign key to wikis.hero

	// Engagement
	viewCount: number;
	uniqueViewers: number;
	averageReadTime: number; // Seconds
	completionRate: number; // 0-1: % who read to end

	// Ratings
	upvotes: number;
	downvotes: number;
	rating: number; // Calculated: upvotes / (upvotes + downvotes)

	// Trending
	viewsLast7Days: number;
	viewsLast30Days: number;
	trendingScore: number; // Calculated based on recent spike

	// Timestamps
	lastViewed: Date;
	updatedAt: Date;
}

// ============================================================================
// COMBINED TYPES (What the API returns)
// ============================================================================

/**
 * Lightweight wiki list item for search/discovery pages
 * This is what GET /v1/wikis should return
 */
export interface WikiListItem {
	// Identity
	hero: string; // Display name
	urlName: string; // URL-safe name for routing

	// Core metadata
	wordCount: number;
	readingTimeMinutes: number;
	storyType: StoryType;
	completeness: number;

	// Discovery
	moods: StoryMood[];
	themes: StoryTheme[];
	hook: string | null;
	teaser: string;

	// Visual
	dominantColor: string | null;
	coverImage: string | null;

	// Richness flags
	hasBackstory: boolean;
	hasSideStory: boolean;
	hasChapters: boolean;
	chapterCount: number;

	// Relationships
	faction: string | null;
	relatedHeroesCount: number;

	// Engagement (from analytics)
	viewCount: number;
	rating: number;
	trendingScore: number;

	// Timestamps
	updatedAt: number; // Unix timestamp
	lastViewed: number | null; // Unix timestamp
}

/**
 * Full wiki data with all metadata (for individual wiki pages)
 */
export interface WikiFull {
	// Core content
	hero: string;
	urlName: string;
	markdown: string;

	// Rich metadata
	metadata: WikiMetadata;
	relationships: WikiRelationships;
	analytics: WikiAnalytics;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Search-optimized wiki data (what Fuse.js will search)
 */
export interface WikiSearchable extends WikiListItem {
	// Additional searchable fields
	plotKeywords: string[];
	characterTraits: string[];
	locations: string[];
	chapterTitles: string[];
	relatedHeroes: string[]; // Full list for search
	openingLine: string | null;
}

// ============================================================================
// FILTER/SORT OPTIONS (For the frontend)
// ============================================================================

export interface WikiFilterOptions {
	moods?: StoryMood[];
	themes?: StoryTheme[];
	storyTypes?: StoryType[];
	factions?: string[];

	// Range filters
	minWordCount?: number;
	maxWordCount?: number;
	minRating?: number;
	minCompleteness?: number;

	// Boolean filters
	hasChapters?: boolean;
	hasSideStory?: boolean;
	hasAbilityLore?: boolean;

	// Trending/popular
	trending?: boolean; // Only show trending
	minViews?: number;
}

export type WikiSortOption =
	| "recent" // updatedAt DESC
	| "popular" // viewCount DESC
	| "trending" // trendingScore DESC
	| "rated" // rating DESC
	| "longest" // wordCount DESC
	| "shortest" // wordCount ASC
	| "connected" // connectionsCount DESC
	| "mysterious" // mysteryLevel DESC
	| "epic"; // epicnessScore DESC

// ============================================================================
// REQUEST/RESPONSE TYPES (For API)
// ============================================================================

export interface GetWikiListRequest {
	filters?: WikiFilterOptions;
	sort?: WikiSortOption;
	limit?: number;
	offset?: number;
}

export interface GetWikiListResponse {
	wikis: WikiListItem[];
	total: number;
	filters: WikiFilterOptions;
	sort: WikiSortOption;
	pagination: {
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

export interface GetWikiSearchRequest {
	query: string;
	filters?: WikiFilterOptions;
	limit?: number;
}

export interface GetWikiSearchResponse {
	results: WikiSearchable[];
	total: number;
	query: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Partial metadata for quick updates
 */
export type WikiMetadataUpdate = Partial<WikiMetadata>;

/**
 * Analytics increment payload
 */
export interface WikiAnalyticsIncrement {
	hero: string;
	viewIncrement?: number;
	upvoteIncrement?: number;
	downvoteIncrement?: number;
	readTime?: number; // Seconds spent reading
}
