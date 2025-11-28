"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const RANK_OPTIONS = [
	{ value: "overall", label: "Overall" },
	{ value: "glory", label: "Glory" },
	{ value: "epic", label: "Epic" },
	{ value: "legend", label: "Legend" },
	{ value: "mythic", label: "Mythic" },
] as const;

const STORAGE_KEY = "stats-rank-preference";

export function RankSelector() {
	const [rank, setRank] = useQueryState(
		"rank",
		parseAsString.withDefault("glory").withOptions({
			// Scroll to top when rank changes (optional)
			scroll: false,
			// Use shallow routing to avoid full page reload
			shallow: false,
		}),
	);

	// Save to localStorage whenever rank changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, rank);
		}
	}, [rank]);

	// Load from localStorage on mount if no URL param
	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const hasRankParam = urlParams.has("rank");

			if (!hasRankParam) {
				const savedRank = localStorage.getItem(STORAGE_KEY);
				if (savedRank && RANK_OPTIONS.some((opt) => opt.value === savedRank)) {
					setRank(savedRank);
				}
			}
		}
	}, [setRank]);

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-muted-foreground">Rank</span>
			<Select value={rank} onValueChange={setRank}>
				<SelectTrigger className="w-[140px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{RANK_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
