"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { ConsolidatedHeroOptional } from "@repo/database";
import Image from "next/image";
import {
	TABLE_CONFIG,
	getWinRateColor,
	getDifficultyColor,
	formatPercentage,
} from "../_config/table-styles";
import { getRoleIcon, getLaneIcon } from "@/lib/get-game-assets";
import { cn, tidyLabel } from "@/lib/utils";
import { resolveImageSrc } from "../../hero/_components/header.hero";

/**
 * Reusable sortable header component with left border accent for sorted state
 */
const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => {
	const isSorted = column.getIsSorted();

	return (
		<div
			className={cn(
				"relative flex items-center gap-2 cursor-pointer select-none hover:text-foreground",
				"justify-center border-l-4 border-transparent py-2",
				isSorted && "border-l-4  border-primary text-primary",
				TABLE_CONFIG.typography.header,
			)}
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			<span>{children}</span>
			<ArrowUp
				className={cn(
					"absolute right-0 text-transparent h-3.5 w-3.5",
					isSorted === "asc" && "text-primary",
				)}
			/>
			<ArrowDown
				className={cn(
					"absolute right-0 text-transparent h-3.5 w-3.5",
					isSorted === "desc" && "text-primary",
				)}
			/>
		</div>
	);
};

const INDEX_SIZE = 40;
const HERO_SIZE = 60;
const RATES_SIZE = 98;

export const columns: ColumnDef<ConsolidatedHeroOptional>[] = [
	{
		id: "index",
		header: () => <div className="text-center select-none text-xs font-semibold sm:text-sm">#</div>,
		cell: ({ row, table }) => {
			// Get index within current page's visible rows (1-based)
			const rows = table.getRowModel().rows;
			const index = rows.findIndex((r) => r.id === row.id) + 1;
			return (
				<div className="text-center text-xs font-medium text-muted-foreground sm:text-sm">
					{index}
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
		size: INDEX_SIZE,
	},
	{
		id: "profile.name",
		accessorKey: "profile.name",
		// header: ({ column }) => <SortableHeader column={column}>Hero</SortableHeader>,
		header: () => (
			<div className="text-center select-none text-xs font-semibold sm:text-sm">Hero</div>
		),
		cell: ({ row }) => {
			const name = row.original.profile.name;
			const avatarUrl = resolveImageSrc(
				row.original.profile.images.squarehead,
				row.original.profile.images.squarehead_big,
				row.original.profile.images.head,
				row.original.profile.images.head_big,
			);
			const urlName = row.original.profile.url_name;

			return (
				<a
					href={`/hero/${encodeURIComponent(urlName)}?rank=overall`}
					className="flex flex-col items-center gap-1.5 py-1 cursor-pointer transition-opacity hover:opacity-80 group"
				>
					<div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
						<Image src={avatarUrl} alt={name} fill className="object-cover" sizes="48px" />
					</div>
					<span
						className={cn(
							TABLE_CONFIG.typography.cellEmphasis,
							"text-center",
							"group-hover:text-primary transition-colors",
						)}
					>
						{tidyLabel(name)}
					</span>
				</a>
			);
		},
		size: HERO_SIZE,
	},
	{
		id: "meta.win_rate",
		accessorKey: "meta.win_rate",
		header: ({ column }) => <SortableHeader column={column}>Win Rate</SortableHeader>,
		cell: ({ row }) => {
			const winRate = row.original.meta.win_rate;
			const colorClass = getWinRateColor(winRate);

			return (
				<div
					className={cn(
						TABLE_CONFIG.typography.cellEmphasis,
						TABLE_CONFIG.alignment.winRate,
						colorClass,
					)}
				>
					{formatPercentage(winRate)}
				</div>
			);
		},
		size: RATES_SIZE,
	},
	{
		id: "meta.pick_rate",
		accessorKey: "meta.pick_rate",
		header: ({ column }) => <SortableHeader column={column}>Pick Rate</SortableHeader>,
		cell: ({ row }) => {
			const pickRate = row.original.meta.pick_rate;

			return (
				<div
					className={cn(
						TABLE_CONFIG.typography.cellEmphasis,
						TABLE_CONFIG.alignment.pickRate,
						TABLE_CONFIG.colors.pickRate,
					)}
				>
					{formatPercentage(pickRate)}
				</div>
			);
		},
		size: RATES_SIZE,
	},
	{
		id: "meta.ban_rate",
		accessorKey: "meta.ban_rate",
		header: ({ column }) => <SortableHeader column={column}>Ban Rate</SortableHeader>,
		cell: ({ row }) => {
			const banRate = row.original.meta.ban_rate;

			return (
				<div
					className={cn(
						TABLE_CONFIG.typography.cellEmphasis,
						TABLE_CONFIG.alignment.banRate,
						TABLE_CONFIG.colors.banRate,
					)}
				>
					{formatPercentage(banRate)}
				</div>
			);
		},
		size: RATES_SIZE,
	},
	{
		id: "role",
		accessorFn: (row) => row.profile.roles[0]?.title || "Unknown",
		header: ({ column }) => <SortableHeader column={column}>Role</SortableHeader>,
		cell: ({ row }) => {
			const role = row.original.profile.roles[0]?.title || "Unknown";
			const roleIcon = getRoleIcon(role);
			return (
				<div className="flex flex-col items-center gap-1 py-1">
					<div className="relative h-6 w-6 flex-shrink-0">
						<Image src={roleIcon} alt={role} fill className="object-contain" sizes="24px" />
					</div>
					<span className={cn(TABLE_CONFIG.typography.cellMuted, "text-center")}>
						{tidyLabel(role)}
					</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		size: RATES_SIZE,
	},
	{
		id: "lane",
		accessorFn: (row) => row.profile.lanes[0]?.title || "Unknown",
		header: ({ column }) => <SortableHeader column={column}>Lane</SortableHeader>,
		cell: ({ row }) => {
			const lane = row.original.profile.lanes[0]?.title || "Unknown";
			const laneIcon = getLaneIcon(lane);
			return (
				<div className="flex flex-col items-center gap-1 py-1">
					<div className="relative h-6 w-6 flex-shrink-0">
						<Image src={laneIcon} alt={lane} fill className="object-contain" sizes="24px" />
					</div>
					<span className={cn(TABLE_CONFIG.typography.cellMuted, "text-center")}>
						{tidyLabel(lane)}
					</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		size: RATES_SIZE,
	},
	{
		id: "difficulty",
		accessorFn: (row) => parseInt(row.profile.difficulty || "0"),
		header: ({ column }) => <SortableHeader column={column}>Difficulty</SortableHeader>,
		cell: ({ row }) => {
			const difficulty = parseInt(row.original.profile.difficulty || "0");
			const colorClass = getDifficultyColor(difficulty);

			return (
				<div
					className={cn(
						TABLE_CONFIG.typography.cellDefault,
						TABLE_CONFIG.alignment.difficulty,
						colorClass,
						"font-medium",
					)}
				>
					{difficulty}/100
				</div>
			);
		},
		size: RATES_SIZE,
	},
];
