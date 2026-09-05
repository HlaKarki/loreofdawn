import { createFileRoute } from "@tanstack/react-router";
import { makeUrl } from "@/lib/utils.api";

const BASE_URL = "https://loreofdawn.com";

type SitemapEntry = {
	url: string;
	lastModified: string;
	changeFrequency: "daily" | "weekly" | "monthly";
	priority: number;
};

type HeroBasic = {
	profile: {
		name: string;
		url_name: string;
	};
};

type WikiBasic = {
	urlName: string;
};

const toXml = (entries: SitemapEntry[]) =>
	`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `<url>
<loc>${entry.url}</loc>
<lastmod>${entry.lastModified}</lastmod>
<changefreq>${entry.changeFrequency}</changefreq>
<priority>${entry.priority}</priority>
</url>`,
	)
	.join("\n")}
</urlset>
`;

async function buildSitemap() {
	const lastModified = new Date().toISOString();

	const staticPages: SitemapEntry[] = [
		{ url: BASE_URL, lastModified, changeFrequency: "daily", priority: 1 },
		{ url: `${BASE_URL}/heroes`, lastModified, changeFrequency: "daily", priority: 0.9 },
		{ url: `${BASE_URL}/lores`, lastModified, changeFrequency: "daily", priority: 0.9 },
		{ url: `${BASE_URL}/meta`, lastModified, changeFrequency: "daily", priority: 0.9 },
		{ url: `${BASE_URL}/stats`, lastModified, changeFrequency: "daily", priority: 0.8 },
	];

	let heroPages: SitemapEntry[] = [];
	try {
		const heroResponse = await fetch(makeUrl("/v1/heroes?limit=200"));
		if (heroResponse.ok) {
			const heroes = (await heroResponse.json()) as HeroBasic[];
			heroPages = heroes.map((hero) => ({
				url: `${BASE_URL}/heroes/${hero.profile.url_name}`,
				lastModified,
				changeFrequency: "weekly" as const,
				priority: 0.7,
			}));
		}
	} catch (error) {
		console.error("Failed to fetch heroes for sitemap:", error);
	}

	let lorePages: SitemapEntry[] = [];
	try {
		const wikiResponse = await fetch(makeUrl("/v1/wikis"));
		if (wikiResponse.ok) {
			const wikis = (await wikiResponse.json()) as WikiBasic[];
			lorePages = wikis.map((wiki) => ({
				url: `${BASE_URL}/lores/${wiki.urlName}`,
				lastModified,
				changeFrequency: "monthly" as const,
				priority: 0.6,
			}));
		}
	} catch (error) {
		console.error("Failed to fetch wikis for sitemap:", error);
	}

	return [...staticPages, ...heroPages, ...lorePages];
}

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () =>
				new Response(toXml(await buildSitemap()), {
					headers: {
						"Content-Type": "application/xml",
						"Cache-Control": "public, max-age=3600",
					},
				}),
		},
	},
});
