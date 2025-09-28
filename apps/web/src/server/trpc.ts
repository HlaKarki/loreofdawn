import "server-only";

import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "@/routers";

async function getCookieHeader() {
	const cookieStore = await cookies();
	const serialized = cookieStore
		.getAll()
		.map(({ name, value }) => `${name}=${value}`)
		.join("; ");
	return serialized.length > 0 ? serialized : undefined;
}

export const serverTrpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
			fetch: async (url, options) => {
				const cookieHeader = await getCookieHeader();
				const headers = new Headers(options?.headers);
				if (cookieHeader) {
					headers.set("cookie", cookieHeader);
				}
				return fetch(url, {
					...options,
					credentials: "include",
					headers,
					cache: "no-store",
				});
			},
		}),
	],
});
