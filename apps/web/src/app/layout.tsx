import "../index.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import Providers from "@/components/providers";
import Header from "@/components/header";
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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="overflow-x-hidden">
			<Script defer src={"https://assets.onedollarstats.com/stonks.js"} />
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
				<NuqsAdapter>
					<Providers>
						<div className="grid grid-rows-[auto_1fr_auto] h-svh overflow-x-hidden">
							<Header />
							<main className="overflow-x-hidden pt-25">{children}</main>
							<AiChat />
							<Footer />
						</div>
					</Providers>
				</NuqsAdapter>
			</body>
		</html>
	);
}
