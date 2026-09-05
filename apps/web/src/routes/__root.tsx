import { ClerkProvider } from "@clerk/tanstack-react-start";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { AiChat } from "@/components/AiChat";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import { WebsiteJsonLd } from "@/components/json-ld";
import Providers from "@/components/providers";
import appCss from "@/index.css?url";

const siteConfig = {
	name: "Lore of Dawn",
	description:
		"Master Mobile Legends: Bang Bang with live meta stats, hero lore, matchup insights, and tier lists. Explore 130+ heroes and make every draft count.",
	url: "https://loreofdawn.com",
	ogImage: "/og-image.png",
	twitterHandle: "@loreofdawn",
};

const ogImageUrl = `${siteConfig.url}${siteConfig.ogImage}`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: siteConfig.name },
			{ name: "description", content: siteConfig.description },
			{
				name: "keywords",
				content: [
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
				].join(", "),
			},
			{ name: "author", content: siteConfig.name },
			{ name: "creator", content: siteConfig.name },
			{ name: "robots", content: "index, follow" },
			{
				name: "googlebot",
				content:
					"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:locale", content: "en_US" },
			{ property: "og:site_name", content: siteConfig.name },
			{ property: "og:title", content: siteConfig.name },
			{ property: "og:description", content: siteConfig.description },
			{ property: "og:image", content: ogImageUrl },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: siteConfig.name },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: siteConfig.name },
			{ name: "twitter:description", content: siteConfig.description },
			{ name: "twitter:image", content: ogImageUrl },
			{ name: "twitter:creator", content: siteConfig.twitterHandle },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon/favicon.ico" },
			{ rel: "shortcut icon", href: "/favicon/favicon.ico" },
			{ rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon/favicon-16x16.png" },
			{ rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon/favicon-32x32.png" },
			{ rel: "apple-touch-icon", href: "/favicon/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.webmanifest" },
		],
		scripts: [{ src: "https://assets.onedollarstats.com/stonks.js", defer: true }],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<WebsiteJsonLd />
			</head>
			<body className="antialiased">
				<ClerkProvider
					afterSignOutUrl={"https://loreofdawn.com"}
					signUpFallbackRedirectUrl={"https://loreofdawn.com"}
					signInFallbackRedirectUrl={"https://loreofdawn.com"}
				>
					<Providers>
						<div className="grid grid-rows-[auto_1fr_auto] h-svh">
							<Header />
							<main className={"pt-25"}>{children}</main>
							<AiChat />
							<Footer />
						</div>
					</Providers>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
