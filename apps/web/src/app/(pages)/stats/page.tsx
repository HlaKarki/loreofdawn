import { Suspense } from "react";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { TABLE_CONFIG } from "./_config/table-styles";
import { TableSkeleton } from "./_components/table-skeleton";
import { makeUrl } from "@/lib/utils.api";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { UpdatedAtLabel } from "../(landing)/_utils";

export const dynamic = "force-dynamic";

async function StatsContent() {
	const rank = "glory"; // TODO
	// fetch real data
	const tableDataResponse = await fetch(makeUrl(`/v1/heroes/table?rank=${rank}`));
	const tableData = (await tableDataResponse.json()) as ConsolidatedHeroOptional[];

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

	return (
		<>
			{/* Header */}
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
					Hero Statistics Dashboard
				</h1>
				<UpdatedAtLabel date={tableData[0].meta.updatedAt} />
			</header>

			{/* Overview Cards */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5 sm:p-4">
					<div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
						Total Heroes
					</div>
					<div className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{totalHeroes}</div>
				</div>
				<div className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5 sm:p-4">
					<div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
						Balanced
					</div>
					<div className="mt-1 text-2xl font-bold text-yellow-500 sm:mt-2 sm:text-3xl">
						{balancedHeroes}
					</div>
					<div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
						{TABLE_CONFIG.overview.balancedHeroes.min * 100}-
						{TABLE_CONFIG.overview.balancedHeroes.max * 100}% Win Rate
					</div>
				</div>
				<div className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5 sm:p-4">
					<div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
						Meta Kings
					</div>
					<div className="mt-1 text-2xl font-bold text-green-500 sm:mt-2 sm:text-3xl">
						{metaKings}
					</div>
					<div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
						&gt;{TABLE_CONFIG.overview.metaKings.min * 100}% Ban Rate
					</div>
				</div>
				<div className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5 sm:p-4">
					<div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
						Forgotten
					</div>
					<div className="mt-1 text-2xl font-bold text-red-500 sm:mt-2 sm:text-3xl">
						{forgottenHeroes}
					</div>
					<div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
						&lt;{TABLE_CONFIG.overview.forgottenHeroes.max * 100}% Pick Rate
					</div>
				</div>
			</div>

			{/* Full Hero Table */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex flex-col gap-1 sm:gap-2">
					<h2 className="text-xl font-semibold sm:text-2xl">All Heroes</h2>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Click "View" to see detailed stats and matchups
					</p>
				</div>
				<DataTable columns={columns} data={tableData} />
			</div>
		</>
	);
}

export default function StatsPage() {
	return (
		<div className="mx-auto flex w-screen max-w-full flex-col gap-6 overflow-x-hidden px-3 pb-12 pt-4 sm:gap-8 sm:px-4 sm:pb-16 sm:pt-6 lg:max-w-7xl lg:px-8">
			<Suspense fallback={<TableSkeleton />}>
				<StatsContent />
			</Suspense>
		</div>
	);
}
