"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const RANKS = [
	{ value: "overall", label: "Overall" },
	{ value: "glory", label: "Glory" },
	// { value: "epic", label: "Epic" },
	// { value: "legend", label: "Legend" },
	// { value: "mythic", label: "Mythic" },
] as const;

type HeroRankSelectorProps = {
	heroName: string;
};

export function HeroRankSelector({ heroName }: HeroRankSelectorProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentRank = searchParams.get("rank") || "overall";

	const handleRankChange = (rank: string) => {
		router.push(`/heroes/${heroName}?rank=${rank}`);
	};

	return (
		<div className="mb-6 flex flex-wrap items-center gap-2">
			<span className="text-sm text-muted-foreground">Rank:</span>
			<div className="flex flex-wrap gap-1">
				{RANKS.map((rank) => (
					<Button
						key={rank.value}
						variant={currentRank === rank.value ? "default" : "outline"}
						size="sm"
						onClick={() => handleRankChange(rank.value)}
						className={
							currentRank === rank.value
								? "bg-amber-500 text-amber-950 hover:bg-amber-600"
								: "border-border/60"
						}
					>
						{rank.label}
					</Button>
				))}
			</div>
		</div>
	);
}
