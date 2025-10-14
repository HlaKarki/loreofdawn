import { env } from "@/env";

export const makeUrl = (endpoint: string) => {
	return `${env.NEXT_PUBLIC_SERVER_URL}${endpoint}`;
};
