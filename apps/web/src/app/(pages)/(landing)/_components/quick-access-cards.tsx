import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Swords, BarChart3, TrendingUp } from "lucide-react";

type QuickAccessCard = {
	title: string;
	description: string;
	href: string;
	icon: React.ReactNode;
	color: string;
	count?: string;
};

type QuickAccessCardsProps = {
	heroCount?: number;
};

export const QuickAccessCards = ({ heroCount = 130 }: QuickAccessCardsProps) => {
	const cards: QuickAccessCard[] = [
		{
			title: "Explore Lores",
			description: "Discover hero stories, narratives, and the world of Mobile Legends",
			href: "/lores",
			icon: <BookOpen className="h-6 w-6" />,
			color: "amber",
			count: `${heroCount}+ stories`,
		},
		{
			title: "Browse Heroes",
			description: "Complete hero directory with profiles, abilities, and relationships",
			href: "/hero",
			icon: <Swords className="h-6 w-6" />,
			color: "blue",
			count: `${heroCount}+ heroes`,
		},
		{
			title: "View Statistics",
			description: "Comprehensive hero stats, win rates, and performance data",
			href: "/stats",
			icon: <BarChart3 className="h-6 w-6" />,
			color: "green",
			count: "Real-time data",
		},
		{
			title: "Meta Analysis",
			description: "Current competitive landscape, trends, and top performer insights",
			href: "/meta",
			icon: <TrendingUp className="h-6 w-6" />,
			color: "purple",
			count: "Updated daily",
		},
	];

	const colorStyles = {
		amber: {
			bg: "bg-amber-500/15 dark:bg-amber-500/10",
			text: "text-amber-700 dark:text-amber-400",
			border: "border-amber-500/30 hover:border-amber-500/50",
			iconBg: "bg-amber-500/20",
		},
		blue: {
			bg: "bg-blue-500/15 dark:bg-blue-500/10",
			text: "text-blue-700 dark:text-blue-400",
			border: "border-blue-500/30 hover:border-blue-500/50",
			iconBg: "bg-blue-500/20",
		},
		green: {
			bg: "bg-green-500/15 dark:bg-green-500/10",
			text: "text-green-700 dark:text-green-400",
			border: "border-green-500/30 hover:border-green-500/50",
			iconBg: "bg-green-500/20",
		},
		purple: {
			bg: "bg-purple-500/15 dark:bg-purple-500/10",
			text: "text-purple-700 dark:text-purple-400",
			border: "border-purple-500/30 hover:border-purple-500/50",
			iconBg: "bg-purple-500/20",
		},
	};

	return (
		<section className="mb-12">
			<div className="mb-6">
				<h2 className="mb-2 text-2xl font-bold">Quick Access</h2>
				<p className="text-sm text-muted-foreground">
					Explore different sections of the Lore of Dawn companion
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{cards.map((card) => {
					const styles = colorStyles[card.color as keyof typeof colorStyles];
					return (
						<Link key={card.href} href={card.href} className="group">
							<Card
								className={`h-full transition-all duration-200 ${styles.border} hover:shadow-lg hover:scale-[1.02]`}
							>
								<CardContent className="flex h-full flex-col p-5">
									<div className={`mb-4 inline-flex rounded-lg p-3 ${styles.iconBg} ${styles.text}`}>
										{card.icon}
									</div>
									<h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
									<p className="mb-3 flex-1 text-sm text-muted-foreground">{card.description}</p>
									{card.count && (
										<div className={`text-xs font-medium ${styles.text}`}>{card.count}</div>
									)}
								</CardContent>
							</Card>
						</Link>
					);
				})}
			</div>
		</section>
	);
};
