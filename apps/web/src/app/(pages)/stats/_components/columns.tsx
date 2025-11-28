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
import type { TableDensity } from "./density-toggle";

/**
 * Reusable sortable header component with left border accent for sorted state
 */
const SortableHeader = ({
	column,
	children,
	densityConfig,
}: {
	column: any;
	children: React.ReactNode;
	densityConfig: DensityConfig;
}) => {
	const isSorted = column.getIsSorted();

	return (
		<div
			className={cn(
				"relative flex items-center gap-2 cursor-pointer select-none hover:text-foreground",
				"justify-center border-l-4 border-transparent",
				densityConfig.header, // Apply density padding here
				densityConfig.fontSize.header,
				isSorted && "border-l-4  border-primary text-primary",
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
const HERO_SIZE_COMPACT = 50; // narrower without image
const HERO_SIZE_COMFORTABLE = 70; // wider with larger image
const RATES_SIZE = 98;

interface DensityConfig {
	cell: string; // padding classes for cells
	header: string; // padding classes for headers
	showHeroImage: boolean;
	heroImageSize: number;
	fontSize: {
		header: string;
		heroName: string;
		cellDefault: string;
		cellEmphasis: string;
		cellMuted: string;
	};
	iconSize: string;
}

export const createColumns = (
	densityConfig: DensityConfig,
): ColumnDef<ConsolidatedHeroOptional>[] => [
	{
		id: "index",
		header: () => (
			<div
				className={cn(
					"text-center select-none font-semibold",
					densityConfig.header,
					densityConfig.fontSize.header,
				)}
			>
				#
			</div>
		),
		cell: ({ row, table }) => {
			// Get index within current page's visible rows (1-based)
			const rows = table.getRowModel().rows;
			const index = rows.findIndex((r) => r.id === row.id) + 1;
			return (
				<div className={cn("text-center font-medium", densityConfig.fontSize.cellMuted)}>
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
		// header: ({ column }) => <SortableHeader column={column} densityConfig={densityConfig}>Hero</SortableHeader>,
		header: () => (
			<div
				className={cn(
					"text-center select-none font-semibold",
					densityConfig.header,
					densityConfig.fontSize.header,
				)}
			>
				Hero
			</div>
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

			// Compact mode: no image, just name
			if (!densityConfig.showHeroImage) {
				return (
					<a
						href={`/hero/${encodeURIComponent(urlName)}?rank=overall`}
						className="flex items-center justify-center py-1 cursor-pointer transition-opacity hover:opacity-80 group"
					>
						<span
							className={cn(
								densityConfig.fontSize.heroName,
								"font-semibold text-center",
								"group-hover:text-primary transition-colors",
							)}
						>
							{tidyLabel(name)}
						</span>
					</a>
				);
			}

			// Normal/Comfortable mode: show image
			return (
				<a
					href={`/hero/${encodeURIComponent(urlName)}?rank=overall`}
					className="flex flex-col items-center gap-1.5 py-1 cursor-pointer transition-opacity hover:opacity-80 group"
				>
					<div
						className="relative flex-shrink-0 overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
						style={{
							width: `${densityConfig.heroImageSize}px`,
							height: `${densityConfig.heroImageSize}px`,
						}}
					>
						<Image
							src={avatarUrl}
							alt={name}
							fill
							className="object-cover"
							sizes={`${densityConfig.heroImageSize}px`}
						/>
					</div>
					<span
						className={cn(
							densityConfig.fontSize.heroName,
							"font-semibold text-center",
							"group-hover:text-primary transition-colors",
						)}
					>
						{tidyLabel(name)}
					</span>
				</a>
			);
		},
		size: densityConfig.showHeroImage
			? densityConfig.heroImageSize > 50
				? HERO_SIZE_COMFORTABLE
				: HERO_SIZE
			: HERO_SIZE_COMPACT,
	},
	{
		id: "meta.win_rate",
		accessorKey: "meta.win_rate",
		header: ({ column }) => (
			<SortableHeader column={column} densityConfig={densityConfig}>
				Win Rate
			</SortableHeader>
		),
		cell: ({ row }) => {
			const winRate = row.original.meta.win_rate;
			const colorClass = getWinRateColor(winRate);

			return (
				<div
					className={cn(
						densityConfig.fontSize.cellEmphasis,
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
		id: "meta.ban_rate",
		accessorKey: "meta.ban_rate",
		header: ({ column }) => (
			<SortableHeader column={column} densityConfig={densityConfig}>
				Ban Rate
			</SortableHeader>
		),
		cell: ({ row }) => {
			const banRate = row.original.meta.ban_rate;

			return (
				<div
					className={cn(
						densityConfig.fontSize.cellEmphasis,
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
		id: "meta.pick_rate",
		accessorKey: "meta.pick_rate",
		header: ({ column }) => (
			<SortableHeader column={column} densityConfig={densityConfig}>
				Pick Rate
			</SortableHeader>
		),
		cell: ({ row }) => {
			const pickRate = row.original.meta.pick_rate;

			return (
				<div
					className={cn(
						densityConfig.fontSize.cellEmphasis,
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
		id: "role",
		accessorFn: (row) => row.profile.roles[0]?.title || "Unknown",
		header: ({ column }) => (
			<SortableHeader column={column} densityConfig={densityConfig}>
				Role
			</SortableHeader>
		),
		cell: ({ row }) => {
			const role = row.original.profile.roles[0]?.title || "Unknown";
			const roleIcon = getRoleIcon(role);
			return (
				<div className="flex flex-col items-center gap-1 py-1">
					<div className={cn("relative flex-shrink-0", densityConfig.iconSize)}>
						<Image src={roleIcon} alt={role} fill className="object-contain" sizes="28px" />
					</div>
					<span className={cn(densityConfig.fontSize.cellMuted, "text-center")}>
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
		header: ({ column }) => (
			<SortableHeader column={column} densityConfig={densityConfig}>
				Lane
			</SortableHeader>
		),
		cell: ({ row }) => {
			const lane = row.original.profile.lanes[0]?.title || "Unknown";
			const laneIcon = getLaneIcon(lane);
			return (
				<div className="flex flex-col items-center gap-1 py-1">
					<div className={cn("relative flex-shrink-0", densityConfig.iconSize)}>
						<Image src={laneIcon} alt={lane} fill className="object-contain" sizes="28px" />
					</div>
					<span className={cn(densityConfig.fontSize.cellMuted, "text-center")}>
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
		header: ({ column }) => (
			<SortableHeader column={column} densityConfig={densityConfig}>
				Difficulty
			</SortableHeader>
		),
		cell: ({ row }) => {
			const difficulty = parseInt(row.original.profile.difficulty || "0");
			const colorClass = getDifficultyColor(difficulty);

			return (
				<div
					className={cn(
						densityConfig.fontSize.cellDefault,
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
