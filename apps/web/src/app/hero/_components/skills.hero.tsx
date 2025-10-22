import Image from "next/image";
import { tidyLabel } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MlHeroProfile } from "@repo/database";
import { resolveImageSrc } from "@/app/hero/_components/header.hero";

export const HeroSkills = ({ data }: { data: MlHeroProfile }) => {
	if (data.skills?.length < 1) {
		return <></>;
	}

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Skills</CardTitle>
				<CardDescription>Hero abilities and their effects</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 sm:space-y-4">
				{data.skills.map((skill, idx) => (
					<div key={idx} className="flex gap-3 rounded-lg border bg-card/50 p-3 sm:gap-4 sm:p-4">
						<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gradient-to-br from-amber-500/20 to-purple-500/20 sm:h-14 sm:w-14">
							<Image
								src={resolveImageSrc(skill.icon)}
								alt={tidyLabel(skill.name)}
								fill
								sizes={"256px"}
								className="object-cover"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<div className="mb-1 flex flex-wrap items-center gap-2">
								<h4 className="font-semibold">{tidyLabel(skill.name)}</h4>
								{skill.tags && skill.tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{skill.tags.map((tag, tagIdx) => (
											<span
												key={tagIdx}
												className="rounded bg-primary/10 px-1.5 py-0.5 text-xs uppercase tracking-wide"
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>
							<p className="mb-2 text-sm text-muted-foreground">{skill.description}</p>
							<div className="flex flex-wrap gap-3 text-xs text-muted-foreground sm:gap-4">
								{skill.cd > 0 && <span>CD: {skill.cd}s</span>}
								{skill.mana > 0 && <span>Mana: {skill.mana}</span>}
							</div>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};
