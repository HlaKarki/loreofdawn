import { Suspense } from "react";
import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional, QuadrantDataType, StatsByRolesType } from "@repo/database";
import type { RedditPostType } from "@repo/utils";
import { TopThree } from "./_components/topThree";
import { StatsByRoles } from "./_components/statsByRoles";
import { QuadrantChart } from "./_components/quadrantChart";
import { CommunityPosts } from "./_components/communityPosts";
import { RankSelector } from "../stats/_components/rank-selector";
import { Crown, Gem, Users } from "lucide-react";

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

async function MetaContent({ rank }: { rank: string }) {
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

	// Calculate meta snapshot data
	const metaKing = topThreeData[0];
	const hiddenGem = hiddenGemData[0];
	const topRole =
		statsByRoleData.data.length > 0
			? [...statsByRoleData.data].sort((a, b) => b.averageWinRate - a.averageWinRate)[0]
			: null;

	const overviewCards = [
		{
			label: "Meta King",
			value: metaKing?.profile.name ?? "—",
			description: metaKing ? `${(metaKing.meta.ban_rate * 100).toFixed(1)}% ban rate` : "Loading...",
			icon: Crown,
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-600",
		},
		{
			label: "Hidden Gem",
			value: hiddenGem?.profile.name ?? "—",
			description: hiddenGem ? `${(hiddenGem.meta.win_rate * 100).toFixed(1)}% win rate` : "Loading...",
			icon: Gem,
			iconBg: "bg-emerald-500/10",
			iconColor: "text-emerald-600",
		},
		{
			label: "Dominant Role",
			value: topRole ? `${topRole.role}s` : "—",
			description: topRole ? `${(topRole.averageWinRate * 100).toFixed(1)}% avg win rate` : "Loading...",
			icon: Users,
			iconBg: "bg-sky-500/10",
			iconColor: "text-sky-600",
		},
	];

	return (
		<>
			{/* Header */}
			<header className="mb-8">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Meta{" "}
							<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
								Insights
							</span>
						</h1>
						<p className="mt-1 text-muted-foreground">
							Current competitive landscape and hero trends
						</p>
					</div>
					<RankSelector />
				</div>
			</header>

			{/* Meta Snapshot (Overview Cards) */}
			<div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
				{overviewCards.map((card) => (
					<div
						key={card.label}
						className="rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-accent/5"
					>
						<div className="mb-3 flex items-center justify-between">
							<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{card.label}
							</span>
							<div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
								<card.icon className={`h-4 w-4 ${card.iconColor}`} />
							</div>
						</div>
						<div className="text-xl font-bold capitalize">{card.value}</div>
						<p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
					</div>
				))}
			</div>

			{/* Meta Picks */}
			<TopThree
				data={topThreeData}
				title="Meta Picks"
				description="Heroes popping off in the current meta."
			/>

			{/* Stats by Role */}
			<StatsByRoles
				data={statsByRoleData.data}
				lastUpdated={topThreeData[0]?.meta.updatedAt}
				rank={rank}
			/>

			{/* Hidden Gems */}
			<TopThree
				data={hiddenGemData}
				title="Hidden Gems"
				description="Underplayed heroes with standout win rates worth trying."
			/>

			{/* Quadrant Chart */}
			<QuadrantChart data={quadrantData} rank={rank} />

			{/* Community Posts */}
			<CommunityPosts data={communityPostsData.posts} />
		</>
	);
}

function MetaLoadingSkeleton() {
	return (
		<div className="space-y-8">
			<div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="h-24 animate-pulse rounded-lg bg-muted" />
				<div className="h-24 animate-pulse rounded-lg bg-muted" />
				<div className="h-24 animate-pulse rounded-lg bg-muted" />
			</div>
			<div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
		</div>
	);
}

export default async function MetaPage({
	searchParams,
}: {
	searchParams: Promise<{ rank?: string }>;
}) {
	const params = await searchParams;
	const rank = params.rank || "glory";

	return (
		<div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
			<Suspense fallback={<MetaLoadingSkeleton />}>
				<MetaContent rank={rank} />
			</Suspense>
		</div>
	);
}
