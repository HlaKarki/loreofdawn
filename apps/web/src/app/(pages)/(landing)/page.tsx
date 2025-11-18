import { makeUrl } from "@/lib/utils.api";
import type { HeroQueryResponse } from "@repo/database";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const topThreeQuery = `/v1/heroes?limit=3&sort=-win_rate,-pick_rate&include=meta&rank=glory`;

export default async function Home() {
	const response = await fetch(makeUrl(topThreeQuery));
	const data: HeroQueryResponse<false>[] = await response.json();

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			{/* Search input */}
			<div>Search</div>

			{/* Three Top Heroes */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-6">Heroes popping off this week</h1>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{data.map((hero) => (
						<Card key={hero.id} className="overflow-hidden pt-0">
							{/* Hero Image */}
							<div className="relative h-48">
								<img
									src={hero.images.painting}
									alt={hero.name}
									className=" w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
								<h2 className="absolute bottom-4 left-4 text-2xl font-bold">{hero.name}</h2>
							</div>

							<CardContent className="p-4">
								{/* Roles */}
								<div className="flex gap-2 mb-3 flex-wrap">
									{hero.roles.map((role: any) => (
										<Badge key={role.title} variant="secondary">
											{role.title}
										</Badge>
									))}
								</div>

								{/* Stats */}
								{hero.meta && (
									<div className="grid grid-cols-3 gap-2 text-sm">
										<div>
											<div className="text-muted-foreground text-xs">Win Rate</div>
											<div className="text-lg font-semibold">
												{(hero.meta.win_rate * 100).toFixed(1)}%
											</div>
										</div>
										<div>
											<div className="text-muted-foreground text-xs">Pick Rate</div>
											<div className="text-lg font-semibold">
												{(hero.meta.pick_rate * 100).toFixed(1)}%
											</div>
										</div>
										<div>
											<div className="text-muted-foreground text-xs">Ban Rate</div>
											<div className="text-lg font-semibold">
												{(hero.meta.ban_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Live Meta Stats */}
			<div>Live meta stats</div>
			<div>Table snapshot? Can view full table on click _ go to stats page/#table</div>
			<div>Quardrant chart? like in football?</div>

			{/* Action buttons */}
			<div>Find your main</div>
			<div>Counter picks</div>
			<div>Did you know?</div>

			{/* Latest */}
			<div>Reddit feed</div>
			<div>Patch notes</div>
		</div>
	);
}
