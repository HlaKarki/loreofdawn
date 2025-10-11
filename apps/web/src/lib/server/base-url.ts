import { headers } from "next/headers";
import { env } from "@/env";

/**
 * Resolve an absolute base URL for server-side fetches.
 * Prefers request headers so it works behind proxies, with an env fallback.
 */
export async function getServerBaseUrl() {
	const headerList = await headers();
	const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
	const protocol = headerList.get("x-forwarded-proto") ?? "http";

	if (host) {
		return `${protocol}://${host}`;
	}

	return env.NEXT_PUBLIC_SERVER_URL;
}
