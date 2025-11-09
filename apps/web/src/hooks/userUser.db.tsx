import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { makeUrl } from "@/lib/utils.api";
import type { userSchemaType } from "@repo/database";

export const QUERY_KEY_useUserDb = "user-auth-useUserdb";

export const useUserDb = () => {
	const { getToken } = useAuth();

	const query = useQuery({
		queryKey: [QUERY_KEY_useUserDb],
		queryFn: async () => {
			const url = makeUrl("/v1/users/me");
			const token = await getToken();
			const response = await fetch(url, {
				headers: { Authorization: `Bearer ${token}` },
			});

			return (await response.json()) as userSchemaType;
		},
		staleTime: 15 * 60 * 1000, // 15 minutes
	});

	return {
		...query,
	};
};
