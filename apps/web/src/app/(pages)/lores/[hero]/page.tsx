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

export async function generateMetadata({ params }: LoreDetailPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const heroName = resolvedParams.hero.toLowerCase();

	try {
		const response = await fetch(makeUrl(`/v1/wikis/${heroName}`), {
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			return {
				title: "Lore Not Found",
			};
		}

		const wiki = (await response.json()) as WikiTableData;
		const displayName = tidyLabel(wiki.hero);
		const metadata = wiki.metadata;

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
			},
			twitter: {
				card: "summary",
				title: `${displayName} Lore | Lore of Dawn`,
				description,
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