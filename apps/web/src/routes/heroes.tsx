import { Outlet, createFileRoute } from "@tanstack/react-router";

const ogImage = "https://loreofdawn.com/og-image.png";
const ogTitle = "MLBB Heroes Directory | Lore of Dawn";
const ogDescription =
	"Browse all 130+ Mobile Legends heroes with live stats, win rates, pick rates, and ban rates.";

export const Route = createFileRoute("/heroes")({
	head: () => ({
		meta: [
			{ title: "Heroes - Stats, Abilities & Matchups | Lore of Dawn" },
			{
				name: "description",
				content:
					"Browse all 130+ Mobile Legends heroes with live stats, win rates, pick rates, and ban rates. Find the best heroes for your rank and playstyle.",
			},
			{ property: "og:title", content: ogTitle },
			{ property: "og:description", content: ogDescription },
			{ property: "og:image", content: ogImage },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: "Lore of Dawn Heroes" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: ogTitle },
			{ name: "twitter:description", content: ogDescription },
			{ name: "twitter:image", content: ogImage },
		],
	}),
	component: HeroLayout,
});

function HeroLayout() {
	return (
		<main className="font-quicksand">
			<Outlet />
		</main>
	);
}
