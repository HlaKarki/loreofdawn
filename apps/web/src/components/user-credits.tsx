"use client";

import { CircleDollarSign, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { userTableTier } from "@repo/database";
import { useUserDb } from "@/hooks/userUser.db";

export const UserCredits = () => {
	const { data: user, error } = useUserDb();

	if (error || !user) {
		return <></>;
	}

	const creditsUsed = user.credits_total - user.credits_remaining;
	const usagePercent = (creditsUsed / user.credits_total) * 100;
	const resetDate = new Date(user.credits_reset_at).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

	const config = tierConfig[user.tier as userTableTier];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					className={cn(
						"group flex items-center gap-1.5 px-2 py-1 rounded-full transition-all",
						"hover:scale-105 active:scale-95",
						"bg-gradient-to-r",
						config.colors,
						config.borderColors,
						"border",
					)}
				>
					<span className={cn("font-semibold text-sm tabular-nums", config.textColors)}>
						{user.credits_remaining}
					</span>
					<CircleDollarSign
						className={cn("w-4 h-4 transition-transform group-hover:rotate-12", config.textColors)}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-72 ml-2 p-0 overflow-hidden" sideOffset={8}>
				{/* Header */}
				<div
					className={cn(
						"relative bg-gradient-to-br p-3 pb-4",
						config.colors,
						config.borderColors,
						"border-b",
					)}
				>
					<div className="relative flex items-start justify-between">
						<div className="space-y-0.5">
							<div className="flex items-baseline gap-1.5">
								<h3
									className={cn(
										"text-2xl font-bold tabular-nums tracking-tight",
										config.textColors,
									)}
								>
									{user.credits_remaining}
								</h3>
								<span className="text-muted-foreground text-sm">/ {user.credits_total}</span>
							</div>
							<span className="text-muted-foreground text-xs line-clamp-0">Available credits</span>
						</div>
						<div
							className={cn(
								"px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
								"flex items-center gap-1",
								config.badgeColors,
							)}
						>
							{user.tier}
						</div>
					</div>
				</div>

				<div className="p-3 space-y-3 bg-background">
					{/* Progress */}
					<div className="space-y-1.5">
						<div className="flex justify-between text-xs">
							<span className="text-muted-foreground">Usage</span>
							<span className="font-medium tabular-nums">
								{creditsUsed} <span className="text-muted-foreground font-normal">used</span>
							</span>
						</div>
						<div className="h-1.5 bg-muted rounded-full overflow-hidden">
							<div
								className={cn(
									"h-full bg-gradient-to-r transition-all duration-700 ease-out rounded-full",
									config.progressColors,
								)}
								style={{ width: `${usagePercent}%` }}
							/>
						</div>
						<div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
							<Calendar className="w-3 h-3" />
							<span>Resets {resetDate}</span>
						</div>
					</div>

					{/* Upgrade Button */}
					<Button
						className={cn("w-full h-8 text-xs font-semibold transition-all", config.upgradeButton)}
						onClick={() => console.log("clicked")}
						variant={user.tier === "free" ? "default" : "default"}
					>
						{user.tier === "mythical" ? "Manage Rank" : "Upgrade Rank"}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

const tierConfig = {
	free: {
		colors: "from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700",
		borderColors: "border-zinc-300 dark:border-zinc-600",
		textColors: "text-zinc-700 dark:text-zinc-300",
		badgeColors:
			"bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600",
		progressColors: "from-zinc-400 to-zinc-500 dark:from-zinc-500 dark:to-zinc-400",
		upgradeButton: "",
		icon: null,
	},
	master: {
		colors: "from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
		borderColors: "border-blue-200 dark:border-blue-800",
		textColors: "text-blue-700 dark:text-blue-300",
		badgeColors:
			"bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20",
		progressColors: "from-blue-500 via-indigo-500 to-blue-600",
		upgradeButton:
			"bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
		icon: null,
	},
	mythical: {
		colors:
			"from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-amber-950/30",
		borderColors: "border-amber-300 dark:border-amber-700/50",
		textColors: "text-amber-700 dark:text-amber-300",
		badgeColors:
			"bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white border-0 shadow-lg shadow-amber-500/30",
		progressColors: "from-amber-500 via-yellow-500 to-amber-600 animate-shimmer",
		upgradeButton:
			"bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600",
		icon: null,
	},
};
