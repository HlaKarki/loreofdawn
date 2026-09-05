import type { MetadataRoute } from "next";
import { makeUrl } from "@/lib/utils.api";

const BASE_URL = "https://loreofdawn.com";

type HeroBasic = {
	profile: {
		name: string;
		url_name: string;
	};
};

type WikiBasic = {
	urlName: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${BASE_URL}/heroes`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/lores`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/meta`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/stats`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
	];

	// Dynamic hero pages
	let heroPages: MetadataRoute.Sitemap = [];
	try {
		const heroResponse = await fetch(makeUrl("/v1/heroes?limit=200"), {
			next: { revalidate: 3600 },
		});
		if (heroResponse.ok) {
			const heroes = (await heroResponse.json()) as HeroBasic[];
			heroPages = heroes.map((hero) => ({
				url: `${BASE_URL}/heroes/${hero.profile.url_name}`,
				lastModified: new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.7,
			}));
		}
	} catch (error) {
		console.error("Failed to fetch heroes for sitemap:", error);
	}

	// Dynamic lore pages
	let lorePages: MetadataRoute.Sitemap = [];
	try {
		const wikiResponse = await fetch(makeUrl("/v1/wikis"), {
			next: { revalidate: 3600 },
		});
		if (wikiResponse.ok) {
			const wikis = (await wikiResponse.json()) as WikiBasic[];
			lorePages = wikis.map((wiki) => ({
				url: `${BASE_URL}/lores/${wiki.urlName}`,
				lastModified: new Date(),
				changeFrequency: "monthly" as const,
				priority: 0.6,
			}));
		}
	} catch (error) {
		console.error("Failed to fetch wikis for sitemap:", error);
	}

	return [...staticPages, ...heroPages, ...lorePages];
}
