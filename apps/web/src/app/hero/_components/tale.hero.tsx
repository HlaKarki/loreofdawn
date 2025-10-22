import type { MlHeroProfile } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HeroTale = ({ data }: { data: MlHeroProfile }) => {
	if (!data.tale) return <></>;

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Tale</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="leading-relaxed text-muted-foreground">{data.tale}</p>
			</CardContent>
		</Card>
	);
};
