import { Hono } from "hono";
import type { Env } from "@/types";
import { cacheKvLayer } from "@/middleware/cache";
import { RedditPostType } from "@repo/utils";

export const communityRouter = new Hono<Env>();

const cV = "v1.0.1";

function transformRedditPost(post: any): RedditPostType {
	const data = post.data;

	// Determine post type
	let postType: "text" | "image" | "video" | "link" | "gallery" = "text";
	if (data.is_gallery) {
		postType = "gallery";
	} else if (data.is_video || data.domain === "v.redd.it") {
		postType = "video";
	} else if (data.post_hint === "image" || data.url?.match(/\.(jpg|jpeg|png|gif)$/i)) {
		postType = "image";
	} else if (data.domain && data.domain !== "self.MobileLegendsGame") {
		postType = "link";
	}

	// Get the best thumbnail - try preview images first, fall back to thumbnail
	let thumbnail: string | null = null;
	if (data.preview?.images?.[0]?.source?.url) {
		// Decode HTML entities in the URL
		thumbnail = data.preview.images[0].source.url.replace(/&amp;/g, "&");
	} else if (
		data.thumbnail &&
		data.thumbnail !== "self" &&
		data.thumbnail !== "default" &&
		data.thumbnail !== "nsfw" &&
		data.thumbnail !== "spoiler"
	) {
		thumbnail = data.thumbnail;
	}

	return {
		id: data.id,
		title: data.title,
		author: data.author,
		flair: data.link_flair_text || null,
		score: data.score,
		commentCount: data.num_comments,
		createdAt: data.created_utc,
		permalink: `https://www.reddit.com${data.permalink}`,
		isStickied: data.stickied,
		content: data.selftext || "",
		thumbnail,
		url: data.url,
		postType,
	};
}

communityRouter.get("/posts", async (c) => {
	const { type } = c.req.query();
	const allowedTypes = new Set(["hot", "new", "best", "top", "rising"]);

	if (!allowedTypes.has(type?.toLowerCase() || "")) {
		return c.json({ posts: [] });
	}

	const cacheKey = `${cV}:community:posts:${type.toLowerCase()}`;

	return (
		(await cacheKvLayer.respond(
			c,
			cacheKey,
			async () => {
				try {
					const response = await fetch(
						`https://www.reddit.com/r/MobileLegendsGame/${type.toLowerCase()}.json`,
						{
							headers: {
								"User-Agent":
									"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
								Accept: "application/json",
							},
						},
					);

					if (!response.ok) {
						return { posts: [] };
					}

					const data: { data: { children: any[] } } = await response.json();

					const transformedPosts = data.data.children
						.filter((post: any) => !post.data.stickied)
						.slice(0, 5)
						.map(transformRedditPost);

					return { posts: transformedPosts };
				} catch (error) {
					return { posts: [] };
				}
			},
			{ ttlSeconds: 300 }, // 5 minutes cache
		)) ?? c.json({ posts: [] })
	);
});
