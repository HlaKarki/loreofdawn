import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional, QuadrantDataType, StatsByRolesType } from "@repo/database";
import type { RedditPostType } from "@repo/utils";
import { TopThree } from "./_components/topThree";
import { StatsByRoles } from "./_components/statsByRoles";
import { QuadrantChart } from "./_components/quadrantChart";
import { CommunityPosts } from "./_components/communityPosts";
import { HeroSearch } from "./_components/heroSearch";

export type StatsByRolesResponse = {
	rank: string;
	lastUpdated: number;
	data: StatsByRolesType[];
};

const topThreeQuery = (rank: string) =>
	`/v1/heroes?limit=3&sort=-ban_rate,-win_rate,-pick_rate&include=meta&rank=${rank}`;
const hiddenGemQuery = (rank: string) =>
	`/v1/heroes?limit=3&sort=-win_rate,pick_rate&filter.min_ban_rate=0.01&filter.max_ban_rate=0.08&filter.max_pick_rate=0.05&filter.min_win_rate=0.52&include=meta&rank=${rank}`;
const quadrantQuery = (rank: string) => `/v1/heroes/quadrant_data?rank=${rank}`;
const statsByRoleQuery = (rank: string) => `/v1/heroes/stats_by_role?rank=${rank}`;
const communityPostsQuery = `/v1/community/posts?type=hot`;

export const dynamic = "force-dynamic";

export default async function Home() {
	const rank = "glory"; // TODO: need to get this from the store

	const topThreeResponse = await fetch(makeUrl(topThreeQuery(rank)));
	const topThreeData: ConsolidatedHeroOptional[] = await topThreeResponse.json();

	const statsByRoleResponse = await fetch(makeUrl(statsByRoleQuery(rank)));
	const statsByRoleData: StatsByRolesResponse = await statsByRoleResponse.json();

	const hiddenGemResponse = await fetch(makeUrl(hiddenGemQuery(rank)));
	const hiddenGemData: ConsolidatedHeroOptional[] = await hiddenGemResponse.json();

	const quadrantResponse = await fetch(makeUrl(quadrantQuery(rank)));
	const quadrantData: QuadrantDataType[] = await quadrantResponse.json();

	const communityPostsResponse = await fetch(makeUrl(communityPostsQuery));
	const communityPostsData: { posts: RedditPostType[] } = await communityPostsResponse.json();

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			{/* Search input */}
			<HeroSearch />

			{/* Three Top Heroes */}
			<TopThree data={topThreeData} />

			{/* Stats by Role */}
			<StatsByRoles
				data={statsByRoleData.data}
				lastUpdated={topThreeData[0].meta.updatedAt}
				rank={rank}
			/>

			<TopThree data={hiddenGemData} />

			{/* Quadrant Chart */}
			<QuadrantChart data={quadrantData} rank={rank} />

			{/* Maybe preview stats table here as well */}

			{/* Action buttons */}
			<div>Find your main</div>
			<div>Counter picks</div>
			<div>Did you know?</div>

			{/* Latest */}
			<CommunityPosts data={communityPostsData.posts} />
		</div>
	);
}
