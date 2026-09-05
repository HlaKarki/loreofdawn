import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { makeUrl } from "@/lib/utils.api";
import type { WikiTableData } from "@repo/database";
import { tidyLabel } from "@/lib/utils";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { LoreDetailClient } from "./_components/lore-detail-client";

type LoreDetailPageProps = {
	params: Promise<{
		hero: string;
	}>;
};

type HeroAssets = {
	images: {
		painting?: string;
		head_big?: string;
		squarehead_big?: string;
	};
};

export async function generateMetadata({ params }: LoreDetailPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const heroName = resolvedParams.hero.toLowerCase();

	try {
		// Fetch wiki and hero assets in parallel
		const [wikiResponse, assetsResponse] = await Promise.all([
			fetch(makeUrl(`/v1/wikis/${heroName}`), { next: { revalidate: 3600 } }),
			fetch(makeUrl(`/v1/heroes/assets/${heroName}`), { next: { revalidate: 3600 } }),
		]);

		if (!wikiResponse.ok) {
			return {
				title: "Lore Not Found",
			};
		}

		const wiki = (await wikiResponse.json()) as WikiTableData;
		const assets = assetsResponse.ok ? ((await assetsResponse.json()) as HeroAssets) : null;

		const displayName = tidyLabel(wiki.hero);
		const metadata = wiki.metadata;
		const heroImage = assets?.images?.painting || assets?.images?.head_big || null;

		const description =
			metadata.teaser ||
			metadata.hook ||
			`Discover the epic backstory and lore of ${displayName} in Mobile Legends: Bang Bang.`;

		const moods = metadata.moods?.slice(0, 3).join(", ") || "";
		const themes = metadata.themes?.slice(0, 3).join(", ") || "";

		return {
			title: `${displayName} - Lore & Backstory`,
			description,
			keywords: [
				displayName,
				"MLBB lore",
				"Mobile Legends story",
				"hero backstory",
				...(moods ? [moods] : []),
				...(themes ? [themes] : []),
			],
			openGraph: {
				title: `${displayName} Lore | Lore of Dawn`,
				description,
				type: "article",
				images: heroImage
					? [{ url: heroImage, width: 800, height: 800, alt: `${displayName} Lore` }]
					: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lore of Dawn" }],
			},
			twitter: {
				card: "summary_large_image",
				title: `${displayName} Lore | Lore of Dawn`,
				description,
				images: heroImage ? [heroImage] : ["/og-image.png"],
			},
		};
	} catch {
		return {
			title: "Lore",
		};
	}
}

export default async function LoreDetailPage({ params }: LoreDetailPageProps) {
	const resolvedParams = await params;
	const heroName = resolvedParams.hero.toLowerCase();

	if (!heroName) {
		notFound();
	}

	const response = await fetch(makeUrl(`/v1/wikis/${heroName}`), {
		next: { revalidate: 3600 }, // Cache for 1 hour
	});

	if (response.status === 404) {
		notFound();
	}

	if (!response.ok) {
		throw new Error("Failed to load lore data");
	}

	const wiki = (await response.json()) as WikiTableData;
	const displayName = tidyLabel(wiki.hero);
	const description =
		wiki.metadata.teaser ||
		wiki.metadata.hook ||
		`Discover the epic backstory of ${displayName}`;

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