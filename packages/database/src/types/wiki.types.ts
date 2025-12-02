/**
 * Enhanced Wiki Types
 * Designed for rich lore discovery and search UX
 */

import z from "zod/v3";

// ============================================================================
// TYPE DEFINITIONS (Flexible strings with examples for AI guidance)
// ============================================================================

// Story mood - Examples: tragic, heroic, mysterious, dark, comedic, romantic, epic, melancholic, triumphant, vengeful
export type StoryMood = string;

// Story theme - Examples: revenge, redemption, betrayal, family, power, sacrifice, love, loss, honor, destiny, corruption, loyalty, freedom, justice
export type StoryTheme = string;

// Story arc - Examples: origin, fall_from_grace, rise_to_power, redemption_arc, tragedy, coming_of_age, quest, ongoing
export type StoryArc = string;

// Story type - Examples: full_backstory, side_story, multi_chapter, snippet, ability_lore, mixed
export type StoryType = string;

// ============================================================================
// CORE WIKI METADATA
// ============================================================================

// ============================================================================
// RELATIONSHIPS
//
// Hero relationships mentioned in lore
// ============================================================================

export const WikiRelationshipsZod = z.object({
	relatedHeroes: z
		.array(z.string())
		.describe(
			"Array of all hero names mentioned in this hero's lore (use url_name format: lowercase with underscores). Examples: ['alucard', 'miya', 'lapu_lapu', 'estes']. Include anyone who appears in the story, regardless of relationship type. Used to build the lore connection graph and suggest related heroes to readers.",
		),
	faction: z
		.string()
		.nullable()
		.describe(
			"Primary faction or organization the hero belongs to. Examples: 'Moniyan Empire', 'Shadow Abyss', 'Eruditio', 'Northern Vale', 'Cadia Riverlands', 'Celestial Palace', 'Laboratory 1718', 'Abyssal Demons', 'Moon Elves'. Use the official faction name from the lore. Null if the hero is independent or unaffiliated.",
		),
	allies: z
		.array(z.string())
		.describe(
			"Hero names (url_name format) of confirmed allies, friends, or comrades. Examples: ['tigreal', 'fanny'] for heroes who fight alongside each other or share a bond of friendship. Only include explicit allies mentioned in the lore, not just people from the same faction.",
		),
	rivals: z
		.array(z.string())
		.describe(
			"Hero names (url_name format) of enemies, rivals, or antagonists. Examples: ['alice', 'vexana'] for heroes in conflict or opposition. Include both personal enemies and factional opponents if explicitly mentioned in the story.",
		),
	family: z
		.array(z.string())
		.describe(
			"Hero names (url_name format) of blood relatives or family members. Examples: ['miya', 'estes'] for siblings, parents, children, or other kin. Only include confirmed family relationships from the lore.",
		),
	mentors: z
		.array(z.string())
		.describe(
			"Hero names (url_name format) of mentors, teachers, or students. Examples: ['zilong', 'yun_zhao'] for master-student relationships. Include both mentors (who taught this hero) and students (who this hero taught). The relationship can go either direction.",
		),

	factionRole: z
		.string()
		.nullable()
		.describe(
			"The hero's role or rank within their faction. Common examples: 'Leader', 'General', 'Commander', 'Member', 'Knight', 'Guardian', 'Exile', 'Founder', 'High Priestess', 'Prince', 'Soldier', 'Outcast'. Use descriptive terms that capture their position or status. Null if not specified or if the hero has no faction.",
		),
	locationTies: z
		.array(
			z.object({
				location: z
					.string()
					.describe(
						"Name of the location or place. Examples: 'Moniyan Empire', 'Azrya', 'Shadow Swamp', 'Dragon Altar', 'Land of Dawn'.",
					),
				relationship: z
					.string()
					.describe(
						"Type of relationship to this location. Common examples: 'birthplace' (born here), 'home' (lives here), 'exile' (banished from), 'conquered' (defeated/claimed), 'visited' (traveled to), 'destroyed' (ruined), 'protects' (guards/defends), 'seeks' (searching for). Choose the word that best describes the connection.",
					),
			}),
		)
		.describe(
			"Array of significant locations in the hero's story with their relationship type. Examples: [{ location: 'Moniyan Empire', relationship: 'birthplace' }, { location: 'Shadow Swamp', relationship: 'exile' }]. Only include locations that are important to the narrative, not just passing mentions.",
		),
});

export type WikiRelationships = z.infer<typeof WikiRelationshipsZod>;

export const WikiMetadataAiGeneratedZod = z.object({
	// Story classification
	storyType: z
		.string()
		.describe(
			"Content type classification. Common examples: 'full_backstory' (complete origin story), 'side_story' (supplemental narrative), 'multi_chapter' (episodic content), 'snippet' (brief lore), 'ability_lore' (powers-focused), 'mixed' (combination). Choose the term that best fits, or use similar descriptive words.",
		),
	storyArc: z
		.string()
		.describe(
			"Character's narrative progression. Common examples: 'origin' (beginning), 'fall_from_grace' (descent), 'rise_to_power' (ascent), 'redemption_arc' (atonement), 'tragedy' (downfall), 'coming_of_age' (growth), 'quest' (journey), 'ongoing' (unresolved). Use similar terms if these don't fit perfectly. Null if no clear arc exists.",
		),

	// Relationships
	relationships: WikiRelationshipsZod,

	// Emotional & thematic tags
	moods: z
		.array(z.string())
		.describe(
			"Array of emotional tones present in the story (1-3 moods). Common examples: 'tragic' (sorrowful), 'heroic' (valiant), 'mysterious' (enigmatic), 'dark' (sinister), 'comedic' (humorous), 'romantic' (loving), 'epic' (grand), 'melancholic' (wistful), 'triumphant' (victorious), 'vengeful' (retributive). Stories can have multiple moods that shift throughout.",
		),
	themes: z
		.array(z.string())
		.describe(
			"Array of core thematic elements (1-3 themes). Common examples: 'revenge' (vengeance), 'redemption' (atonement), 'betrayal' (treachery), 'family' (kinship), 'power' (dominance), 'sacrifice' (selflessness), 'love' (devotion), 'loss' (grief), 'honor' (integrity), 'destiny' (fate), 'corruption' (moral decay), 'loyalty' (allegiance), 'freedom' (liberation), 'justice' (righteousness). Choose themes that resonate most strongly.",
		),

	// Hooks & teasers
	hook: z
		.string()
		.nullable()
		.describe(
			"Most compelling or emotional line from the story (150-180 chars). The single quote that makes you want to read more. Should evoke emotion, create intrigue, or reveal character depth. Extract directly from the story or craft one that captures its essence. Null if no line truly stands out.",
		),
	teaser: z
		.string()
		.describe(
			"Short compelling description (150-200 chars) that hooks the reader. Think Netflix-style pitch: create intrigue, hint at conflict, evoke emotion, and make the reader curious. Should feel like a movie trailer tagline. Examples: 'Once a noble knight, now a cursed wanderer seeking redemption in a world that turned its back on him.' Keep it punchy and atmospheric.",
		),
	openingLine: z
		.string()
		.nullable()
		.describe(
			"The opening line of the hero's story. Should be impactful, atmospheric, and set the tone for the entire narrative. If the actual first line from the source material is compelling, use it verbatim. If not, craft a better opening that captures the story's essence and draws readers in immediately. Think of iconic book openings.",
		),

	// Visual & style
	dominantColor: z
		.string()
		.nullable()
		.describe(
			"Hex color code (e.g., '#8B4513' for brown, '#4A0E4E' for dark purple) representing the hero's visual identity and thematic essence. Used for dynamic UI backgrounds, cards, and theming. Choose based on: hero's element (fire=red/orange, ice=blue, nature=green), personality (dark/brooding=deep colors, cheerful=bright), or visual design. Must be valid hex format.",
		),

	// Content richness flags
	hasBackstory: z
		.boolean()
		.describe(
			"Content flag: true if the hero has a substantial main backstory/origin story section with meaningful narrative depth",
		),
	hasSideStory: z
		.boolean()
		.describe(
			"Content flag: true if the hero has additional side story chapters that expand the lore beyond the main narrative",
		),
	hasAbilityLore: z
		.boolean()
		.describe(
			"Content flag: true if ability descriptions include narrative context, story elements, or lore explanations (not just mechanical descriptions like 'deals X damage')",
		),
	hasTrivia: z
		.boolean()
		.describe(
			"Content flag: true if the hero has a trivia/fun facts section with interesting details, references, or easter eggs",
		),
	hasChapters: z
		.boolean()
		.describe(
			"Content flag: true if the side story is divided into multiple distinct chapters with individual titles",
		),
	chapterCount: z
		.number()
		.describe(
			"Total number of side story chapters. Set to 0 if no chapters exist. Should match the length of chapterTitles array.",
		),
	chapterTitles: z
		.array(z.string())
		.describe(
			"Array of all side story chapter titles in sequential order. Empty array [] if no chapters. Used for table of contents, navigation, and search. Each title should be concise and meaningful (e.g., ['Moonless Night', 'Journey Out', 'Farewell at the Edge']).",
		),

	// Searchable content
	plotKeywords: z
		.array(z.string())
		.describe(
			"Key plot elements, story beats, and narrative hooks (3-10 keywords). Examples: ['assassination attempt', 'lost love', 'ancient prophecy', 'exile', 'forbidden magic', 'war-torn homeland']. Use descriptive phrases that capture major story moments and themes. Used for thematic search and content discovery.",
		),
	characterTraits: z
		.array(z.string())
		.describe(
			"Core personality traits and defining characteristics (3-8 traits). Examples: ['noble', 'cunning', 'tormented', 'wise', 'ruthless', 'compassionate', 'proud', 'vengeful']. Choose adjectives that define who this character IS. Helps users discover heroes with specific personality types they're interested in.",
		),
	locations: z
		.array(z.string())
		.describe(
			"Geographic locations, places, and realms mentioned in the lore (e.g., ['Moniyan Empire', 'Shadow Swamp', 'Azrya', 'Eruditio', 'Cadia Riverlands']). Include birthplaces, homes, battle sites, or any significant places tied to the hero's story. Enables location-based discovery and world-building connections between heroes.",
		),
});

export type WikiMetadataAiGenerated = z.infer<typeof WikiMetadataAiGeneratedZod>;

/**
 * Rich metadata for wiki content - stored in wikis.metadata JSONB column
 */
export interface WikiMetadata extends WikiMetadataAiGenerated {
	// Content metrics
	wordCount: number;
	readingTimeMinutes: number;
	coverImage: string | null;

	// Quality indicators
	artworkCount: number;
	hasVoiceLines: boolean;

	// Scoring (calculated/curated)
	rarityScore: number; // 0-100: How unique/rare is this lore?
	epicnessScore: number; // 0-100: Scale of story (personal vs world-ending)
	mysteryLevel: number; // 0-100: How many unanswered questions?
	connectionsCount: number; // How many other heroes mentioned?

	// Auto-generated
	createdAt: number;
	updatedAt: number;
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

/**
 * Search-optimized wiki data (what Fuse.js will search)
 */

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

export interface GetWikiListRequest {}

export interface GetWikiListResponse {}

export interface GetWikiSearchRequest {}

export interface GetWikiSearchResponse {}

// ============================================================================
// UTILITY TYPES
// ============================================================================

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

export const AiMarkdownResponseZod = z.object({
	profile: z.object({
		markdown: z
			.string()
			.describe(
				"Hero profile section: basic identity, species, affiliation, and core character overview",
			),
	}),
	story: z.object({
		markdown: z
			.string()
			.describe("Main backstory: the hero's origin, defining moments, and primary narrative arc"),
	}),
	bio: z.object({
		markdown: z
			.string()
			.describe("Character biography: personality, motivations, relationships, and current status"),
	}),
	side_story: z
		.object({
			chapters: z
				.array(
					z.object({
						title: z
							.string()
							.describe(
								"Concise, meaningful chapter title without repeating the side story name (e.g., 'Moonless Night' instead of 'Time of Lunar Eclipse — Moonless Night')",
							),
						content: z.object({
							markdown: z
								.string()
								.describe(
									"Chapter content: a self-contained narrative segment with proper paragraphs and dialogue in blockquote format",
								),
						}),
					}),
				)
				.optional()
				.default([]),
		})
		.describe(
			"Optional side story content: additional narrative chapters that expand on the hero's lore beyond the main story",
		)
		.optional(),
	abilities: z
		.array(
			z.object({
				slot: z
					.string()
					.describe(
						'Ability slot identifier. Some common examples: Passive", "Skill 1", "Skill 2", "Skill 3", "Morph", "Ultimate. ',
					),
				name: z.string().describe("Official ability name as it appears in-game"),
				cooldown: z
					.number()
					.min(0)
					.optional()
					.describe("Cooldown duration in seconds; 0 or omit for passive abilities"),
				cost: z
					.number()
					.min(0)
					.nullable()
					.describe("Mana or energy cost to activate; omit if not applicable"),
				role: z
					.string()
					.optional()
					.describe(
						'Primary function category of the ability. Some common examples: "Damage", "Control", "Mobility", "Defense", "Utility". ',
					),
				details: z.object({
					markdown: z
						.string()
						.describe(
							"Full ability description: effects, mechanics, scaling values, and usage notes in clean markdown",
						),
				}),
			}),
		)
		.min(1)
		.max(15)
		.describe(
			"Array of hero abilities (minimum 3, maximum 6): includes passive, skills, and ultimate",
		),
	trivia: z
		.array(
			z.object({
				markdown: z
					.string()
					.describe(
						"A single trivia fact: interesting lore detail, reference, easter egg, or fun fact about the hero",
					),
			}),
		)
		.optional()
		.default([])
		.describe(
			"Collection of trivia items: miscellaneous facts and interesting details about the hero",
		),
});
export type AiMarkdownResponse = z.infer<typeof AiMarkdownResponseZod>;

export interface WikiTableData {
	hero: string;
	urlName: string;
	sections: AiMarkdownResponse;
	markdown: string;
	metadata: WikiMetadata;
	lastUpdated: number | null;
}
