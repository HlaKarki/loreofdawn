import { env } from "@/env";

export const makeUrl = (endpoint: string) => {
	return `${env.VITE_SERVER_URL}${endpoint}`;
};
