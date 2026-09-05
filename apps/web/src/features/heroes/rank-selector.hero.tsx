import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const RANKS = [
	{ value: "overall", label: "Overall" },
	{ value: "glory", label: "Glory" },
	// { value: "epic", label: "Epic" },
	// { value: "legend", label: "Legend" },
	// { value: "mythic", label: "Mythic" },
] as const;

export function HeroRankSelector() {
	const navigate = useNavigate();
	const currentRank = useSearch({ from: "/heroes/$hero", select: (s) => s.rank }) || "overall";

	const handleRankChange = (rank: (typeof RANKS)[number]["value"]) => {
		navigate({ to: ".", search: (prev) => ({ ...prev, rank }) });
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
