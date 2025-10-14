import type { ConsolidatedHero } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HeroTale = ({ hero }: { hero: ConsolidatedHero }) => {
	if (!hero.tale) return <></>;

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Tale</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="leading-relaxed text-muted-foreground">{hero.tale}</p>
			</CardContent>
		</Card>
	);
};
