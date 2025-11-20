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

export const dynamic = "force-dynamic"; // TODO

export default async function Home() {
	const rank = "glory"; // TODO: need to get this from the store

	const [topThreeData, statsByRoleData, hiddenGemData, quadrantData, communityPostsData] =
		await Promise.all([
			fetch(makeUrl(topThreeQuery(rank))).then(
				(r) => r.json() as Promise<ConsolidatedHeroOptional[]>,
			),
			fetch(makeUrl(statsByRoleQuery(rank))).then((r) => r.json() as Promise<StatsByRolesResponse>),
			fetch(makeUrl(hiddenGemQuery(rank))).then(
				(r) => r.json() as Promise<ConsolidatedHeroOptional[]>,
			),
			fetch(makeUrl(quadrantQuery(rank))).then((r) => r.json() as Promise<QuadrantDataType[]>),
			fetch(makeUrl(communityPostsQuery)).then(
				(r) => r.json() as Promise<{ posts: RedditPostType[] }>,
			),
		]);

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
			{/* Search input */}
			<HeroSearch />

			{/* Three Top Heroes */}
			<TopThree
				data={topThreeData}
				title="Meta Picks"
				description="Heroes popping off in the current meta."
			/>

			{/* Stats by Role */}
			<StatsByRoles
				data={statsByRoleData.data}
				lastUpdated={topThreeData[0].meta.updatedAt}
				rank={rank}
			/>

			<TopThree
				data={hiddenGemData}
				title="Hidden Gems"
				description="Underplayed heroes with standout win rates worth trying."
			/>

			{/* Quadrant Chart */}
			<QuadrantChart data={quadrantData} rank={rank} />

			{/* Latest */}
			<CommunityPosts data={communityPostsData.posts} />
		</div>
	);
}
