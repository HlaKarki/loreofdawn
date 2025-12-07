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
	title: "Heroes - Stats, Abilities & Matchups",
	description:
		"Browse all 130+ Mobile Legends heroes with live stats, win rates, pick rates, and ban rates. Find the best heroes for your rank and playstyle.",
	openGraph: {
		title: "MLBB Heroes Directory | Lore of Dawn",
		description:
			"Browse all 130+ Mobile Legends heroes with live stats, win rates, pick rates, and ban rates.",
		images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lore of Dawn Heroes" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "MLBB Heroes Directory | Lore of Dawn",
		description:
			"Browse all 130+ Mobile Legends heroes with live stats, win rates, pick rates, and ban rates.",
		images: ["/og-image.png"],
	},
};

export default function HeroLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <main className={cn(quicksand.className)}>{children}</main>;
}
