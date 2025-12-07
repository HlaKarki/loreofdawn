import "../index.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import Providers from "@/components/providers";
import Header from "@/components/header/header";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Script from "next/script";
import { AiChat } from "@/components/AiChat";
import Footer from "@/components/footer";
import { WebsiteJsonLd } from "@/components/json-ld";
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const siteConfig = {
	name: "Lore of Dawn",
	description:
		"Master Mobile Legends: Bang Bang with live meta stats, hero lore, matchup insights, and tier lists. Explore 130+ heroes and make every draft count.",
	url: "https://loreofdawn.com",
	ogImage: "/og-image.png",
	twitterHandle: "@loreofdawn",
};

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	keywords: [
		"Mobile Legends",
		"MLBB",
		"hero lore",
		"meta",
		"tier list",
		"hero stats",
		"win rate",
		"pick rate",
		"ban rate",
		"Land of Dawn",
		"MLBB guide",
	],
	authors: [{ name: "Lore of Dawn" }],
	creator: "Lore of Dawn",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteConfig.url,
		siteName: siteConfig.name,
		title: siteConfig.name,
		description: siteConfig.description,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: siteConfig.name,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.name,
		description: siteConfig.description,
		images: [siteConfig.ogImage],
		creator: siteConfig.twitterHandle,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: [
			{ url: "/favicon/favicon.ico" },
			{ url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/favicon/apple-touch-icon.png",
		shortcut: "/favicon/favicon.ico",
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<WebsiteJsonLd />
			</head>
			<Script defer src={"https://assets.onedollarstats.com/stonks.js"} />
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<NuqsAdapter>
					<Providers>
						<div className="grid grid-rows-[auto_1fr_auto] h-svh">
							<Header />
							<main className={"pt-25"}>{children}</main>
							<AiChat />
							<Footer />
						</div>
					</Providers>
				</NuqsAdapter>
			</body>
		</html>
	);
}
