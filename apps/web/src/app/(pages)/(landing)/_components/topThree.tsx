import { resolveImageSrc } from "../../hero/_components/header.hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { UpdatedAtLabel } from "../_utils";

export const TopThree = ({ data }: { data: ConsolidatedHeroOptional[] }) => {
	const updatedAt = (data.length && data[0].meta.updatedAt) ?? undefined;

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-3xl font-bold">Heroes popping off this week</h1>
				{updatedAt && <UpdatedAtLabel date={updatedAt} />}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{data.map((hero) => {
					const image = resolveImageSrc(
						hero.profile.images.painting,
						hero.profile.images.squarehead_big,
						hero.profile.images.head_big,
					);

					return (
						<Card key={hero.profile.id} className="overflow-hidden pt-0">
							{/* Hero Image */}
							<div className="relative h-48">
								<img src={image} alt={hero.profile.name} className="w-full h-full object-cover" />
								<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
								<h2 className="absolute bottom-4 left-4 text-2xl font-bold">{hero.profile.name}</h2>
							</div>

							<CardContent className="p-4">
								{/* Roles */}
								<div className="flex gap-2 mb-3 flex-wrap">
									{hero.profile.roles.map((role) => (
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
					);
				})}
			</div>
		</div>
	);
};
