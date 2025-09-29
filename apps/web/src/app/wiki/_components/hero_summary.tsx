import type { RawHeroTypeMLBB } from "@/types/scraper.types";
import Image from "next/image";

const stripHtml = (value: string | null | undefined) => {
	if (!value) {
		return "";
	}

	return value
		.replace(/<br\s*\/?\>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

type NormalizedHero = {
	name: string;
	portraitSrc: string | null;
	roles: string[];
	lanes: string[];
	specialties: string[];
	difficulty?: string;
	story?: string;
	tale?: string;
	skills: { name: string; desc: string; cd?: string; icon?: string | null }[];
};

export function normalizeHero(raw: RawHeroTypeMLBB): NormalizedHero {
	const hd = raw?.data?.hero?.data;

	const portraitSrc = hd?.squareheadbig ?? hd?.squarehead ?? hd?.head ?? hd?.smallmap ?? null;

	const roles =
		hd?.sortlabel?.filter(Boolean) ??
		hd?.sortid?.map((r) => r?.data?.sort_title).filter(Boolean) ??
		[];

	const lanes =
		hd?.roadsortlabel?.filter(Boolean) ??
		hd?.roadsort?.map((r) => r?.data?.road_sort_title).filter(Boolean) ??
		[];

	const specialties = (hd?.speciality ?? []).filter(Boolean);

	const skills =
		hd?.heroskilllist
			?.flatMap((g) => g?.skilllist ?? [])
			.map((s) => ({
				name: s?.skillname ?? "Unknown Skill",
				desc: s?.skilldesc ?? "",
				cd: s?.["skillcd&cost"],
				icon: typeof s?.skillicon === "string" ? s.skillicon : null,
			})) ?? [];

	return {
		name: hd?.name ?? "Unknown",
		portraitSrc,
		roles: Array.from(new Set(roles)),
		lanes: Array.from(new Set(lanes)),
		specialties: Array.from(new Set(specialties)),
		difficulty: hd?.difficulty?.trim(),
		story: stripHtml(hd?.story?.trim()),
		tale: stripHtml(hd?.tale?.trim()),
		skills,
	};
}

export const HeroSummary = ({ hero: heroData }: { hero: RawHeroTypeMLBB }) => {
	const hero = normalizeHero(heroData);
	if (!hero) {
		return null;
	}

	return (
		<section
			id={"hero-overview"}
			className="mb-8 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 shadow-lg"
		>
			<div className="relative border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
				<div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
					<div className="flex-1 space-y-3">
						<p className="text-xs font-semibold uppercase tracking-widest text-primary">
							Hero Overview
						</p>
						<div className="space-y-2">
							<h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
								{hero.name}
							</h2>
							{hero.difficulty && (
								<div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
									<span className="text-muted-foreground">Difficulty:</span>
									<span className="font-bold text-foreground">{hero.difficulty}/100</span>
								</div>
							)}
						</div>
						{hero.story && (
							<p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
								{hero.story}
							</p>
						)}
					</div>
					{hero.portraitSrc && (
						<div className="relative">
							<div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 blur-sm" />
							<img
								src={hero.portraitSrc || "/placeholder.svg"}
								alt={`${hero.name} portrait`}
								className="relative h-28 w-28 flex-shrink-0 rounded-xl border-2 border-border/50 object-cover shadow-xl md:h-32 md:w-32"
								loading="lazy"
							/>
						</div>
					)}
				</div>
			</div>

			<div className="p-6">
				<div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{hero.roles.length > 0 && (
						<div className="group rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-md">
							<h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
								Roles
							</h3>
							<div className="flex flex-wrap gap-1.5">
								{hero.roles.map((role) => (
									<span
										key={role}
										className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
									>
										{role}
									</span>
								))}
							</div>
						</div>
					)}
					{hero.lanes.length > 0 && (
						<div className="group rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-md">
							<h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
								Preferred Lanes
							</h3>
							<div className="flex flex-wrap gap-1.5">
								{hero.lanes.map((lane) => (
									<span
										key={lane}
										className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
									>
										{lane}
									</span>
								))}
							</div>
						</div>
					)}
					{hero.specialties.length > 0 && (
						<div className="group rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-md">
							<h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
								Specialties
							</h3>
							<div className="flex flex-wrap gap-1.5">
								{hero.specialties.map((specialty) => (
									<span
										key={specialty}
										className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
									>
										{specialty}
									</span>
								))}
							</div>
						</div>
					)}
				</div>

				{hero.tale && (
					<div className="mb-6 rounded-lg border border-border/50 bg-muted/30 p-4">
						<h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Tale</h3>
						<p className="text-pretty text-sm leading-relaxed text-muted-foreground">{hero.tale}</p>
					</div>
				)}

				{hero.skills.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-xs font-bold uppercase tracking-widest text-primary">Abilities</h3>
						<ul className="grid gap-4 md:grid-cols-2">
							{hero.skills.map((skill, index) => {
								const name = stripHtml(skill?.name);
								const description = stripHtml(skill?.desc);
								const cooldown = stripHtml(skill?.cd);
								const icon = skill.icon;

								return (
									<li
										key={`${name || "skill"}-${index}`}
										className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-lg"
									>
										<div className="flex items-start gap-3">
											{icon ? (
												<div className="relative flex-shrink-0">
													<Image
														src={icon || "/placeholder.svg"}
														alt={name || "Skill icon"}
														className="relative h-12 w-12 rounded-lg object-contain p-1 "
														loading="lazy"
														width={32}
														height={32}
													/>
												</div>
											) : null}
											<div className="flex-1 space-y-2">
												<div className="flex items-start justify-between gap-2">
													<p className="text-balance text-sm font-bold leading-tight text-foreground">
														{name || "Unknown Skill"}
													</p>
													{cooldown && (
														<span className="flex-shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
															{cooldown}
														</span>
													)}
												</div>
												{description && (
													<p className="text-pretty text-xs leading-relaxed text-muted-foreground">
														{description}
													</p>
												)}
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</div>
		</section>
	);
};
