import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { cn } from "@/lib/utils";

const quicksand = Quicksand({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
	variable: "--font-quicksand",
	preload: true,
	adjustFontFallback: true,
});

export const metadata: Metadata = {
	title: "Hero Lores - Epic Tales & Backstories",
	description:
		"Discover the rich stories behind every Mobile Legends hero. Explore epic tales, character backstories, relationships, and the lore of the Land of Dawn.",
	openGraph: {
		title: "MLBB Hero Lores | Lore of Dawn",
		description:
			"Discover the rich stories behind every Mobile Legends hero. Explore epic tales and backstories.",
		images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lore of Dawn" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "MLBB Hero Lores | Lore of Dawn",
		description:
			"Discover the rich stories behind every Mobile Legends hero. Explore epic tales and backstories.",
		images: ["/og-image.png"],
	},
};

export default function LoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <main className={cn(quicksand.className)}>{children}</main>;
}
