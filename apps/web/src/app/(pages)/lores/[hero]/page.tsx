import { notFound } from "next/navigation";
import { makeUrl } from "@/lib/utils.api";
import type { WikiTableData } from "@repo/database";
import { LoreDetailClient } from "./_components/lore-detail-client";

type LoreDetailPageProps = {
	params: Promise<{
		hero: string;
	}>;
};

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

	return <LoreDetailClient wiki={wiki} />;
}