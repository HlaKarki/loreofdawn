import type { RawHeroTypeMLBB } from "@/types/scraper.types";

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
	skills: {
		name: string;
		desc: string;
		cd: number | null;
		mana_cost: number | null;
		icon?: string | null;
	}[];
};

// e.g. "CD: 8   Mana Cost: 80"  -> { cd: 8, manaCost: 80 }
//      "CD: 7.5s Mana Cost: 60" -> { cd: 7.5, manaCost: 60 }
//      "" or undefined           -> { cd: null, manaCost: null }
const parseCdAndMana = (raw?: string) => {
	if (!raw) return { cd: null as number | null, manaCost: null as number | null };

	const text = raw.replace(/\s+/g, " ").trim();

	const num = (s: string | undefined | null) => {
		const m = s?.match(/(\d+(?:\.\d+)?)/); // first number only
		return m ? Number(m[1]) : null;
	};

	const cd = (() => {
		const m = text.match(/cd\s*:\s*([^:]+)/i);
		return num(m?.[1] ?? null);
	})();

	const manaCost = (() => {
		const m = text.match(/mana\s*cost\s*:\s*([^:]+)/i);
		return num(m?.[1] ?? null);
	})();

	return { cd, manaCost };
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
			.map((s) => {
				const { cd, manaCost } = parseCdAndMana(s?.["skillcd&cost"]);
				return {
					name: s?.skillname ?? "Unknown Skill",
					desc: s?.skilldesc ?? "",
					cd,
					mana_cost: manaCost,
					icon: typeof s?.skillicon === "string" ? s.skillicon : null,
				};
			}) ?? [];

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

	// Use painting as primary background, fallback to smallmap
	const backgroundImage = heroData.data.hero.data.painting || heroData.data.hero.data.smallmap;

	return (
		<section
			id="hero-overview"
			className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
		>
			{/* Hero Header with Background */}
			<div className="relative min-h-[300px] border-b border-white/10">
				{/* Background Image with Overlay */}
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat"
					style={{ backgroundImage: `url(${backgroundImage})` }}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
				<div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-slate-900/90" />

				{/* Content */}
				<div className="relative z-10 flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
					<div className="flex-1 space-y-4">
						<span className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-300 backdrop-blur-md border border-violet-400/30">
							<span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
							Hero Overview
						</span>

						<div className="space-y-3">
							<h2 className="text-balance text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
								{hero.name}
							</h2>

							{hero.difficulty && (
								<div className="inline-flex items-center gap-3 rounded-xl border border-white/5 px-4 py-2 backdrop-blur-md">
									<span className="text-sm font-medium text-slate-300">Difficulty</span>
									<div className="flex items-center gap-2">
										<div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700">
											<div
												className="h-full bg-violet-500 transition-all duration-500"
												style={{ width: `${hero.difficulty}%` }}
											/>
										</div>
										<span className="text-lg font-bold text-white">{hero.difficulty}</span>
									</div>
								</div>
							)}
						</div>

						{hero.story && (
							<p className="max-w-2xl text-pretty text-base leading-relaxed text-slate-200 drop-shadow-md">
								{hero.story}
							</p>
						)}
					</div>

					{hero.portraitSrc && (
						<div className="relative">
							<img
								src={hero.portraitSrc}
								alt={`${hero.name} portrait`}
								className="h-40 w-40 rounded-2xl border-2 border-white/30 object-cover shadow-2xl md:h-48 md:w-48"
							/>
						</div>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="p-8 space-y-8">
				{/* Stats Grid */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{hero.roles.length > 0 && (
						<div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20">
							<div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 opacity-0 group-hover:opacity-10 transition-opacity" />
							<h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
								<span className="h-1 w-6 bg-violet-500 rounded-full" />
								Roles
							</h3>
							<div className="flex flex-wrap gap-2">
								{hero.roles.map((role, index) => {
									const icon = heroData.data.hero.data.sortid?.[index]?.data?.sort_icon;
									return (
										<span
											key={role}
											className="flex items-center gap-2 rounded-lg bg-violet-500/20 px-3 py-2 text-sm font-bold text-violet-200 border border-violet-400/30 hover:bg-violet-500/30 transition-colors"
										>
											{icon && <img src={icon} alt={role} className="h-5 w-5 object-contain" />}
											{role}
										</span>
									);
								})}
							</div>
						</div>
					)}

					{hero.lanes.length > 0 && (
						<div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20">
							<div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 opacity-0 group-hover:opacity-10 transition-opacity" />
							<h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
								<span className="h-1 w-6 bg-violet-500 rounded-full" />
								Preferred Lanes
							</h3>
							<div className="flex flex-wrap gap-2">
								{hero.lanes.map((lane, index) => {
									const laneIcon = heroData.data.hero.data.roadsort?.[index]?.data?.road_sort_icon;
									return (
										<span
											key={lane}
											className="flex items-center gap-2 rounded-lg bg-violet-500/20 px-3 py-2 text-sm font-bold text-violet-200 border border-violet-400/30 hover:bg-violet-500/30 transition-colors"
										>
											{laneIcon && (
												<img src={laneIcon} alt={lane} className="h-5 w-5 object-contain" />
											)}
											{lane}
										</span>
									);
								})}
							</div>
						</div>
					)}

					{hero.specialties.length > 0 && (
						<div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20 sm:col-span-2 lg:col-span-1">
							<div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 opacity-0 group-hover:opacity-10 transition-opacity" />
							<h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
								<span className="h-1 w-6 bg-violet-500 rounded-full" />
								Specialties
							</h3>
							<div className="flex flex-wrap gap-2">
								{hero.specialties.map((specialty) => (
									<span
										key={specialty}
										className="rounded-lg bg-violet-500/20 px-3 py-2 text-sm font-bold text-violet-200 border border-violet-400/30 hover:bg-violet-500/30 transition-colors"
									>
										{specialty}
									</span>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Tale */}
				{hero.tale && (
					<div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 backdrop-blur-sm">
						<div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/20 blur-3xl rounded-full" />
						<h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-400">
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
							</svg>
							Tale
						</h3>
						<p className="relative text-pretty text-sm leading-relaxed text-slate-300">
							{hero.tale}
						</p>
					</div>
				)}

				{/* Abilities */}
				{hero.skills.length > 0 && (
					<div className="space-y-5">
						<h3 className="flex items-center gap-3 text-lg font-bold uppercase tracking-wider text-white">
							<span className="h-1 w-8 bg-violet-500 rounded-full" />
							Abilities
							<span className="h-1 flex-1 bg-gradient-to-r from-violet-500/50 to-transparent rounded-full" />
						</h3>
						<ul className="grid gap-4 md:grid-cols-2">
							{hero.skills.map((skill, index) => {
								const name = stripHtml(skill?.name);
								const description = stripHtml(skill?.desc);
								const icon = skill.icon;

								return (
									<li
										key={`${name || "skill"}-${index}`}
										className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 backdrop-blur-sm transition-all hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-500/20"
									>
										<div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 opacity-0 group-hover:opacity-5 transition-opacity" />
										<div className="relative flex items-start gap-4">
											{icon && (
												<div className="relative flex-shrink-0">
													<div className="absolute inset-0 bg-gradient-to-br from-violet-500/50 to-violet-500/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
													<div className="relative h-14 w-14 rounded-xl bg-slate-700/50 p-2.5 border border-white/10 group-hover:border-violet-400/50 transition-colors flex items-center justify-center">
														<img
															src={icon}
															alt={name || "Skill icon"}
															className="h-full w-full object-contain"
														/>
													</div>
												</div>
											)}
											<div className="flex-1 space-y-2 min-w-0">
												<div className="flex items-start justify-between gap-3">
													<p className="text-balance text-base font-bold leading-tight text-white">
														{name || "Unknown Skill"}
													</p>
													{(skill.cd !== null || skill.mana_cost !== null) && (
														<span className="flex-shrink-0 rounded-lg border border-violet-400/30 bg-violet-500/20 px-2.5 py-1 text-xs font-bold text-violet-300 whitespace-nowrap">
															{skill.cd !== null && <>CD: {skill.cd}</>}{" "}
															{skill.mana_cost !== null && <>Mana Cost: {skill.mana_cost}</>}
														</span>
													)}
												</div>
												{description && (
													<p className="text-pretty text-sm leading-relaxed text-slate-300">
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
