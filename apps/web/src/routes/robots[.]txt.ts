import { createFileRoute } from "@tanstack/react-router";

const robots = `User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://loreofdawn.com/sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(robots, {
					headers: { "Content-Type": "text/plain" },
				}),
		},
	},
});
