import { createFileRoute } from "@tanstack/react-router";
import { LorePageClient, type WikiListing } from "@/features/lores/lore-page-client";
import { makeUrl } from "@/lib/utils.api";

const title = "Hero Lores - Epic Tales & Backstories | Lore of Dawn";
const description =
	"Discover the rich stories behind every Mobile Legends hero. Explore epic tales, character backstories, relationships, and the lore of the Land of Dawn.";
const socialTitle = "MLBB Hero Lores | Lore of Dawn";
const socialDescription =
	"Discover the rich stories behind every Mobile Legends hero. Explore epic tales and backstories.";
const ogImage = "https://loreofdawn.com/og-image.png";

export const Route = createFileRoute("/lores/")({
	loader: async () => {
		const response = await fetch(makeUrl("/v1/wikis"));

		if (!response.ok) {
			throw new Error(`Failed to load lore data: ${response.status} ${response.statusText}`);
		}

		const wikis = (await response.json()) as WikiListing[];

		if (!Array.isArray(wikis)) {
			throw new Error("Invalid response format from API");
		}

		return { wikis };
	},
	head: () => ({
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:title", content: socialTitle },
			{ property: "og:description", content: socialDescription },
			{ property: "og:image", content: ogImage },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: "Lore of Dawn" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: socialTitle },
			{ name: "twitter:description", content: socialDescription },
			{ name: "twitter:image", content: ogImage },
			{ property: "og:url", content: "https://loreofdawn.com/lores" },
		],
		links: [{ rel: "canonical", href: "https://loreofdawn.com/lores" }],
	}),
	component: LorePage,
});

function LorePage() {
	const { wikis } = Route.useLoaderData();

	return <LorePageClient wikis={wikis} />;
}
