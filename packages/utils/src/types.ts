export type RedditPostType = {
	id: string;
	title: string;
	author: string;
	flair: string | null;
	score: number;
	commentCount: number;
	createdAt: number;
	permalink: string;
	isStickied: boolean;
	content: string;
	thumbnail: string | null;
	url: string;
	postType: "text" | "image" | "video" | "link" | "gallery";
};
