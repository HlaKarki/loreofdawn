import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Swords, TrendingUp } from "lucide-react";

type QuickAccessCard = {
	title: string;
	description: string;
	href: Route;
	icon: React.ReactNode;
	iconBg: string;
	iconColor: string;
};

type QuickAccessCardsProps = {
	heroCount?: number;
};

export const QuickAccessCards = ({ heroCount = 130 }: QuickAccessCardsProps) => {
	const cards: QuickAccessCard[] = [
		{
			title: "Hero Lores",
			description: "Discover the stories behind each hero",
			href: "/lores",
			icon: <BookOpen className="h-5 w-5" />,
			iconBg: "bg-amber-500/10",
			iconColor: "text-amber-600 dark:text-amber-400",
		},
		{
			title: "Hero Directory",
			description: "Browse all heroes with stats and abilities",
			href: "/hero",
			icon: <Swords className="h-5 w-5" />,
			iconBg: "bg-sky-500/10",
			iconColor: "text-sky-600 dark:text-sky-400",
		},
		{
			title: "Statistics",
			description: "Detailed performance data and trends",
			href: "/stats",
			icon: <BarChart3 className="h-5 w-5" />,
			iconBg: "bg-emerald-500/10",
			iconColor: "text-emerald-600 dark:text-emerald-400",
		},
		{
			title: "Meta Report",
			description: "Current tier lists and competitive picks",
			href: "/meta",
			icon: <TrendingUp className="h-5 w-5" />,
			iconBg: "bg-violet-500/10",
			iconColor: "text-violet-600 dark:text-violet-400",
		},
	];

	return (
		<section>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Explore</h2>
				<span className="text-sm text-muted-foreground">{heroCount}+ heroes</span>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{cards.map((card) => (
					<Link
						key={card.href}
						href={card.href}
						className="group flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border hover:bg-accent/30"
					>
						<div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
							{card.icon}
						</div>
						<div className="flex-1">
							<h3 className="mb-1 font-medium">{card.title}</h3>
							<p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
						</div>
						<div className="mt-3 flex items-center text-xs text-muted-foreground">
							<span className="group-hover:text-foreground transition-colors">Explore</span>
							<ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
						</div>
					</Link>
				))}
			</div>
		</section>
	);
};
