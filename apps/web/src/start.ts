import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart } from "@tanstack/react-start";
import { getClerkSecretKey } from "./clerk-secret";

export const startInstance = createStart(() => ({
	requestMiddleware: [
		clerkMiddleware(() => ({
			secretKey: getClerkSecretKey(),
			authorizedParties: [
				"https://cf-api.loreofdawn.com",
				"https://loreofdawn.com",
				"https://auth.loreofdawn.com",
				"http://localhost:1201",
			],
		})),
	],
}));
