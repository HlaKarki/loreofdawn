import { resolveImageSrc } from "../../heroes/_components/header.hero";
import { Badge } from "@/components/ui/badge";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { UpdatedAtLabel } from "../_utils";
import { tidyLabel } from "@/lib/utils";

type TopThreeProps = {
	data: ConsolidatedHeroOptional[];
	title?: string;
	description?: string;
};

export const TopThree = ({ data, title = "Top Heroes", description }: TopThreeProps) => {
	const updatedAt = data.length > 0 ? data[0]?.meta?.updatedAt : undefined;

	return (
		<div className="mb-12">
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex-1">
					<h2 className="text-2xl font-bold">{title}</h2>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
					)}
				</div>
				{updatedAt && <UpdatedAtLabel date={updatedAt} />}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
				{data.map((hero) => {
					const image = resolveImageSrc(
						hero.profile.images.painting,
						hero.profile.images.squarehead_big,
						hero.profile.images.head_big,
					);

					return (
						<div
								key={hero.profile.id}
								className="overflow-hidden rounded-2xl border border-border/60 bg-card"
							>
								{/* Hero Image */}
								<div className="relative h-48">
									<img
										src={image}
										alt={hero.profile.name}
										className="w-full h-full object-cover object-top"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
									<h2 className="absolute bottom-4 left-4 text-2xl font-bold">{hero.profile.name}</h2>
								</div>

								<div className="p-4">
									{/* Roles */}
									<div className="flex gap-2 mb-3 flex-wrap">
										{hero.profile.roles.map((role) => (
											<Badge key={role.title} variant="secondary" className="bg-background/60">
												{tidyLabel(role.title)}
											</Badge>
										))}
									</div>

									{/* Stats */}
									{hero.meta && (
										<div className="grid grid-cols-3 gap-2 text-sm">
											<div>
												<div className="text-muted-foreground text-xs">Win Rate</div>
												<div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
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
												<div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
													{(hero.meta.ban_rate * 100).toFixed(1)}%
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
					);
				})}
			</div>
		</div>
	);
};
