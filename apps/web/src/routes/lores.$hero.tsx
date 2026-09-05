import type { WikiTableData } from "@repo/database";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { LoreDetailClient } from "@/features/lores/lore-detail-client";
import { tidyLabel } from "@/lib/utils";
import { makeUrl } from "@/lib/utils.api";

type HeroAssets = {
	images: {
		painting?: string;
		head_big?: string;
		squarehead_big?: string;
	};
};

const fallbackOgImage = "https://loreofdawn.com/og-image.png";

export const Route = createFileRoute("/lores/$hero")({
	loader: async ({ params }) => {
		const heroName = params.hero.toLowerCase();

		const [wikiResponse, assetsResponse] = await Promise.all([
			fetch(makeUrl(`/v1/wikis/${heroName}`)),
			fetch(makeUrl(`/v1/heroes/assets/${heroName}`)),
		]);

		if (!wikiResponse.ok) {
			throw notFound();
		}

		const wiki = (await wikiResponse.json()) as WikiTableData;
		const assets = assetsResponse.ok ? ((await assetsResponse.json()) as HeroAssets) : null;

		return {
			heroName,
			wiki,
			heroImage: assets?.images?.painting || assets?.images?.head_big || null,
		};
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};

		const { heroName, wiki, heroImage } = loaderData;
		const displayName = tidyLabel(wiki.hero);
		const metadata = wiki.metadata;

		const description =
			metadata.teaser ||
			metadata.hook ||
			`Discover the epic backstory and lore of ${displayName} in Mobile Legends: Bang Bang.`;

		const moods = metadata.moods?.slice(0, 3).join(", ") || "";
		const themes = metadata.themes?.slice(0, 3).join(", ") || "";

		const socialTitle = `${displayName} Lore | Lore of Dawn`;
		const image = heroImage ?? fallbackOgImage;

		return {
			meta: [
				{ title: `${displayName} - Lore & Backstory` },
				{ name: "description", content: description },
				{
					name: "keywords",
					content: [
						displayName,
						"MLBB lore",
						"Mobile Legends story",
						"hero backstory",
						...(moods ? [moods] : []),
						...(themes ? [themes] : []),
					].join(","),
				},
				{ property: "og:title", content: socialTitle },
				{ property: "og:description", content: description },
				{ property: "og:image", content: image },
				{ property: "og:image:width", content: heroImage ? "800" : "1200" },
				{ property: "og:image:height", content: heroImage ? "800" : "630" },
				{
					property: "og:image:alt",
					content: heroImage ? `${displayName} Lore` : "Lore of Dawn",
				},
				{ property: "og:type", content: "article" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: socialTitle },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: image },
			],
			links: [{ rel: "canonical", href: `https://loreofdawn.com/lores/${heroName}` }],
		};
	},
	component: LoreDetailPage,
});

function LoreDetailPage() {
	const { heroName, wiki } = Route.useLoaderData();
	const displayName = tidyLabel(wiki.hero);
	const description =
		wiki.metadata.teaser || wiki.metadata.hook || `Discover the epic backstory of ${displayName}`;

	return (
		<>
			<BreadcrumbJsonLd
				items={[
					{ name: "Home", url: "https://loreofdawn.com" },
					{ name: "Lores", url: "https://loreofdawn.com/lores" },
					{ name: displayName, url: `https://loreofdawn.com/lores/${heroName}` },
				]}
			/>
			<ArticleJsonLd
				title={`${displayName} - Lore & Backstory`}
				description={description}
				url={`https://loreofdawn.com/lores/${heroName}`}
			/>
			<LoreDetailClient wiki={wiki} />
		</>
	);
}
