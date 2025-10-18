export interface WikiType {
	name: string;
	markdown: string;
	json?: string;
	updatedAt: number;
}

export interface AiMarkdownResponse {
	name: string;
	profile: { markdown: string };
	story: { markdown: string };
	bio: { markdown: string };
	side_story: {
		chapters: {
			title: string;
			content: { markdown: string };
		}[];
	};
	abilities: {
		slot: string;
		name: string;
		cooldown: number;
		role: string;
		details: { markdown: string };
	}[];
	trivia: { markdown: string }[];
}
