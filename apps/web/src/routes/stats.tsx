import type { ConsolidatedHeroOptional } from "@repo/database";
import { Await, createFileRoute } from "@tanstack/react-router";
import { BarChart3, Crown, Ghost, Scale } from "lucide-react";
import { z } from "zod";
import { UpdatedAtLabel } from "@/components/updated-at-label";
import { DataTable } from "@/features/stats/data-table";
import { RankSelector } from "@/features/stats/rank-selector";
import { TableSkeleton } from "@/features/stats/table-skeleton";
import { TABLE_CONFIG } from "@/features/stats/table-styles";
import { makeUrl } from "@/lib/utils.api";

const title = "Statistics - Hero Win Rates, Pick Rates & Ban Rates | Lore of Dawn";
const description =
	"Complete Mobile Legends hero statistics table with live win rates, pick rates, and ban rates. Compare all heroes and find the best performers for your rank.";
const socialTitle = "MLBB Hero Statistics | Lore of Dawn";
const socialDescription =
	"Complete Mobile Legends hero statistics with live win rates, pick rates, and ban rates.";
const ogImage = "https://loreofdawn.com/og-image.png";

const fetchTableData = (rank: string) =>
	fetch(makeUrl(`/v1/heroes/table?rank=${rank}`)).then(
		(r) => r.json() as Promise<ConsolidatedHeroOptional[]>,
	);

export const Route = createFileRoute("/stats")({
	validateSearch: z.object({ rank: z.enum(["overall", "glory"]).optional().catch("glory") }),
	loaderDeps: ({ search }) => ({ rank: search.rank ?? "glory" }),
	loader: ({ deps: { rank } }) => ({ tableData: fetchTableData(rank) }),
	head: () => ({
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:title", content: socialTitle },
			{ property: "og:description", content: socialDescription },
			{ property: "og:image", content: ogImage },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: "Lore of Dawn Statistics" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: socialTitle },
			{ name: "twitter:description", content: socialDescription },
			{ name: "twitter:image", content: ogImage },
		],
		links: [{ rel: "canonical", href: "https://loreofdawn.com/stats" }],
	}),
	component: StatsPage,
});

function StatsContent({ rank, tableData }: { rank: string; tableData: ConsolidatedHeroOptional[] }) {
	// Calculate overview stats using centralized config
	const totalHeroes = tableData.length;
	const balancedHeroes = tableData.filter(
		(h) =>
			h.meta.win_rate >= TABLE_CONFIG.overview.balancedHeroes.min &&
			h.meta.win_rate <= TABLE_CONFIG.overview.balancedHeroes.max,
	).length;
	const metaKings = tableData.filter(
		(h) => h.meta.ban_rate > TABLE_CONFIG.overview.metaKings.min,
	).length;
	const forgottenHeroes = tableData.filter(
		(h) => h.meta.pick_rate < TABLE_CONFIG.overview.forgottenHeroes.max,
	).length;

	const overviewCards = [
		{
			label: "Total Heroes",
			value: totalHeroes,
			description: "In the roster",
			icon: BarChart3,
			accent: "text-foreground",
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-600",
		},
		{
			label: "Balanced",
			value: balancedHeroes,
			description: `${TABLE_CONFIG.overview.balancedHeroes.min * 100}-${TABLE_CONFIG.overview.balancedHeroes.max * 100}% WR`,
			icon: Scale,
			accent: "text-amber-600 dark:text-amber-400",
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-600",
		},
		{
			label: "Meta Kings",
			value: metaKings,
			description: `>${TABLE_CONFIG.overview.metaKings.min * 100}% Ban Rate`,
			icon: Crown,
			accent: "text-emerald-600 dark:text-emerald-400",
			iconBg: "bg-emerald-500/10",
			iconColor: "text-emerald-600",
		},
		{
			label: "Forgotten",
			value: forgottenHeroes,
			description: `<${TABLE_CONFIG.overview.forgottenHeroes.max * 100}% Pick Rate`,
			icon: Ghost,
			accent: "text-rose-600 dark:text-rose-400",
			iconBg: "bg-rose-500/10",
			iconColor: "text-rose-600",
		},
	];

	return (
		<>
			{/* Header */}
			<header className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Hero{" "}
							<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
								Statistics
							</span>
						</h1>
						<p className="mt-1 text-muted-foreground">
							Compare win rates, pick rates, and ban rates across all heroes
						</p>
					</div>
					<div className="flex items-center gap-3">
						{tableData[0] && <UpdatedAtLabel date={tableData[0].meta.updatedAt} />}
						<RankSelector />
					</div>
				</div>
			</header>

			{/* Overview Cards */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
						<div className={`text-2xl font-bold sm:text-3xl ${card.accent}`}>{card.value}</div>
						<p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
					</div>
				))}
			</div>

			{/* Full Hero Table */}
			<DataTable data={tableData} rank={rank} />
		</>
	);
}

function StatsPage() {
	const rank = Route.useSearch().rank ?? "glory";
	const { tableData } = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-screen sm:max-w-7xl flex-col gap-6 overflow-x-hidden px-4 pb-16 pt-8 sm:gap-8 sm:px-6 lg:px-8">
			<Await promise={tableData} fallback={<TableSkeleton />}>
				{(data) => <StatsContent rank={rank} tableData={data} />}
			</Await>
		</div>
	);
}
