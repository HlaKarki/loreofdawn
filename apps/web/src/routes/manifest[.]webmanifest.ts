import { createFileRoute } from "@tanstack/react-router";

const manifest = {
	name: "loreofdawn",
	short_name: "loreofdawn",
	description: "my pwa app",
	start_url: "/",
	display: "standalone",
	background_color: "#ffffff",
	theme_color: "#000000",
	icons: [
		{
			src: "/favicon/web-app-manifest-192x192.png",
			sizes: "192x192",
			type: "image/png",
		},
		{
			src: "/favicon/web-app-manifest-512x512.png",
			sizes: "512x512",
			type: "image/png",
		},
	],
};

export const Route = createFileRoute("/manifest.webmanifest")({
	server: {
		handlers: {
			GET: () =>
				new Response(JSON.stringify(manifest), {
					headers: { "Content-Type": "application/manifest+json" },
				}),
		},
	},
});
