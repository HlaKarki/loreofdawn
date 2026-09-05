import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { z } from "zod";
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
	// { value: "epic", label: "Epic" },
	// { value: "legend", label: "Legend" },
	// { value: "mythic", label: "Mythic" },
] as const;

type Rank = (typeof RANK_OPTIONS)[number]["value"];

const rankSchema = z.enum(["overall", "glory"]).catch("glory");

const STORAGE_KEY = "stats-rank-preference";

export function RankSelector() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { rank?: string };
	const rank = rankSchema.parse(search.rank);

	const setRank = useCallback(
		(value: Rank) => {
			navigate({
				to: ".",
				search: (prev) => ({ ...prev, rank: value }),
				resetScroll: false,
			});
		},
		[navigate],
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
					setRank(savedRank as Rank);
				}
			}
		}
	}, [setRank]);

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-muted-foreground">Rank:</span>
			<Select value={rank} onValueChange={(value) => setRank(value as Rank)}>
				<SelectTrigger className="w-[120px] border-amber-500/30 bg-amber-500/5 font-medium">
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
