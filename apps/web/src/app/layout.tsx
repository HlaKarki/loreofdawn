import "../index.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import Providers from "@/components/providers";
import Header from "@/components/header/header";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Script from "next/script";
import { AiChat } from "@/components/AiChat";
import Footer from "@/components/footer";
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "loreofdawn",
	description: "loreofdawn",
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
