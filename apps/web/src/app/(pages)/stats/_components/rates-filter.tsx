"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export type RateFilterType = "win_rate" | "pick_rate" | "ban_rate";

export interface RateFilter {
	type: RateFilterType;
	label: string;
	min?: number;
	max?: number;
}

interface RatesFilterProps {
	onFilterChange: (filters: RateFilter[]) => void;
}

// Predefined filter options
const FILTER_PRESETS = {
	win_rate: [
		{ label: "All", min: undefined, max: undefined },
		{ label: "High (>52%)", min: 0.52, max: undefined },
		{ label: "Balanced (48-52%)", min: 0.48, max: 0.52 },
		{ label: "Low (<48%)", min: undefined, max: 0.48 },
		// Future: { label: "Custom...", custom: true }
	],
	ban_rate: [
		{ label: "All", min: undefined, max: undefined },
		{ label: "Banned Often (>10%)", min: 0.1, max: undefined },
		{ label: "Sometimes Banned (5-10%)", min: 0.05, max: 0.1 },
		{ label: "Rarely Banned (<5%)", min: undefined, max: 0.05 },
	],
	pick_rate: [
		{ label: "All", min: undefined, max: undefined },
		{ label: "Popular (>5%)", min: 0.05, max: undefined },
		{ label: "Average (2-5%)", min: 0.02, max: 0.05 },
		{ label: "Unpopular (<2%)", min: undefined, max: 0.02 },
	],
} as const;

export function RatesFilter({ onFilterChange }: RatesFilterProps) {
	const [activeFilters, setActiveFilters] = useState<{
		win_rate: number;
		ban_rate: number;
		pick_rate: number;
	}>({
		win_rate: 0, // index 0 = "All"
		ban_rate: 0,
		pick_rate: 0,
	});

	const handleFilterSelect = (type: RateFilterType, index: number) => {
		const newFilters = { ...activeFilters, [type]: index };
		setActiveFilters(newFilters);

		// Build filter array
		const filters: RateFilter[] = [];

		if (newFilters.win_rate > 0) {
			const preset = FILTER_PRESETS.win_rate[newFilters.win_rate];
			filters.push({
				type: "win_rate",
				label: preset.label,
				min: preset.min,
				max: preset.max,
			});
		}

		if (newFilters.ban_rate > 0) {
			const preset = FILTER_PRESETS.ban_rate[newFilters.ban_rate];
			filters.push({
				type: "ban_rate",
				label: preset.label,
				min: preset.min,
				max: preset.max,
			});
		}

		if (newFilters.pick_rate > 0) {
			const preset = FILTER_PRESETS.pick_rate[newFilters.pick_rate];
			filters.push({
				type: "pick_rate",
				label: preset.label,
				min: preset.min,
				max: preset.max,
			});
		}

		onFilterChange(filters);
	};

	const hasActiveFilters =
		activeFilters.win_rate > 0 || activeFilters.ban_rate > 0 || activeFilters.pick_rate > 0;

	const activeFilterCount = [
		activeFilters.win_rate,
		activeFilters.ban_rate,
		activeFilters.pick_rate,
	].filter((v) => v > 0).length;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={cn("h-10 relative", hasActiveFilters && "border-primary")}
				>
					<Filter className="h-4 w-4 sm:mr-2" />
					<span className="hidden sm:inline">Rates</span>
					{hasActiveFilters && (
						<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
							{activeFilterCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[240px]">
				<DropdownMenuLabel>Filter by Rates</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Win Rate Filters */}
				<div className="space-y-2 p-2">
					<div className="text-xs font-medium text-muted-foreground">Win Rate</div>
					<div className="flex flex-wrap gap-1">
						{FILTER_PRESETS.win_rate.map((preset, index) => (
							<Button
								key={preset.label}
								variant={activeFilters.win_rate === index ? "default" : "outline"}
								size="sm"
								className="h-7 text-xs"
								onClick={() => handleFilterSelect("win_rate", index)}
							>
								{preset.label}
							</Button>
						))}
					</div>
				</div>

				<DropdownMenuSeparator />

				{/* Ban Rate Filters */}
				<div className="space-y-2 p-2">
					<div className="text-xs font-medium text-muted-foreground">Ban Rate</div>
					<div className="flex flex-wrap gap-1">
						{FILTER_PRESETS.ban_rate.map((preset, index) => (
							<Button
								key={preset.label}
								variant={activeFilters.ban_rate === index ? "default" : "outline"}
								size="sm"
								className="h-7 text-xs"
								onClick={() => handleFilterSelect("ban_rate", index)}
							>
								{preset.label}
							</Button>
						))}
					</div>
				</div>

				<DropdownMenuSeparator />

				{/* Pick Rate Filters */}
				<div className="space-y-2 p-2">
					<div className="text-xs font-medium text-muted-foreground">Pick Rate</div>
					<div className="flex flex-wrap gap-1">
						{FILTER_PRESETS.pick_rate.map((preset, index) => (
							<Button
								key={preset.label}
								variant={activeFilters.pick_rate === index ? "default" : "outline"}
								size="sm"
								className="h-7 text-xs"
								onClick={() => handleFilterSelect("pick_rate", index)}
							>
								{preset.label}
							</Button>
						))}
					</div>
				</div>

				{hasActiveFilters && (
					<>
						<DropdownMenuSeparator />
						<div className="p-2">
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-full text-xs"
								onClick={() => {
									setActiveFilters({ win_rate: 0, ban_rate: 0, pick_rate: 0 });
									onFilterChange([]);
								}}
							>
								Clear All Filters
							</Button>
						</div>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
