import { serverTrpc } from "@/server/trpc";
import type { HeroNameKey } from "@/data/ml/hero_ids";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HeroPageProps {
	params: Promise<{
		hero: string;
	}>;
}

export default async function HeroPage({ params }: HeroPageProps) {
	const resolvedParams = await params;
	const hero = resolvedParams.hero.trim().toLowerCase() as HeroNameKey;

	const consolidated = await serverTrpc.mlData.consolidated.query({
		hero: hero,
		rank: "overall",
	});

	if (!consolidated) {
		return (
			<div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4">
				<p className="text-muted-foreground">Hero not found</p>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
			{/* Hero Header */}
			<div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
				<div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-purple-500/10">
					<Image
						src={consolidated.images.painting || consolidated.images.head_big}
						alt={consolidated.name}
						fill
						className="object-cover"
						priority
					/>
				</div>
				<div className="flex flex-1 flex-col gap-4">
					<div>
						<h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl">
							{consolidated.name}
						</h1>
						<p className="text-lg text-muted-foreground">{consolidated.tagline}</p>
					</div>

					{/* Key Stats */}
					<div className="grid grid-cols-3 gap-3">
						<div className="rounded-lg border bg-card p-4">
							<div className="text-sm text-muted-foreground">Win Rate</div>
							<div className="mt-1 text-2xl font-bold text-green-500">
								{((consolidated.win_rate ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
						<div className="rounded-lg border bg-card p-4">
							<div className="text-sm text-muted-foreground">Pick Rate</div>
							<div className="mt-1 text-2xl font-bold text-blue-500">
								{((consolidated.pick_rate ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
						<div className="rounded-lg border bg-card p-4">
							<div className="text-sm text-muted-foreground">Ban Rate</div>
							<div className="mt-1 text-2xl font-bold text-red-500">
								{((consolidated.ban_rate ?? 0) * 100).toFixed(1)}%
							</div>
						</div>
					</div>

					{/* Roles and Lanes */}
					<div className="flex flex-wrap gap-6">
						{consolidated.roles.filter((role) => role.title.trim()).length > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-muted-foreground">Roles:</span>
								<div className="flex gap-1.5">
									{consolidated.roles
										.filter((role) => role.title.trim())
										.map((role, idx) => (
											<div
												key={idx}
												className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium"
											>
												<Image src={role.icon} alt={role.title} width={16} height={16} />
												{role.title}
											</div>
										))}
								</div>
							</div>
						)}
						{consolidated.lanes.filter((lane) => lane.title.trim()).length > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-muted-foreground">Lanes:</span>
								<div className="flex gap-1.5">
									{consolidated.lanes
										.filter((lane) => lane.title.trim())
										.map((lane, idx) => (
											<div
												key={idx}
												className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium"
											>
												<Image src={lane.icon} alt={lane.title} width={16} height={16} />
												{lane.title}
											</div>
										))}
								</div>
							</div>
						)}
						{consolidated.difficulty && (
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
								<span className="rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium">
									{consolidated.difficulty}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Story */}
			{consolidated.tale && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Story</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="leading-relaxed text-muted-foreground">{consolidated.tale}</p>
					</CardContent>
				</Card>
			)}

			{/* Skills */}
			{consolidated.skills && consolidated.skills.length > 0 && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Skills</CardTitle>
						<CardDescription>Hero abilities and their effects</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{consolidated.skills.map((skill, idx) => (
							<div key={idx} className="flex gap-4 rounded-lg border bg-card/50 p-4">
								<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-gradient-to-br from-amber-500/20 to-purple-500/20">
									<Image src={skill.icon} alt={skill.name} fill className="object-cover" />
								</div>
								<div className="flex-1">
									<div className="mb-1 flex items-center gap-3">
										<h4 className="font-semibold">{skill.name}</h4>
										{skill.tags && skill.tags.length > 0 && (
											<div className="flex gap-1">
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
									<div className="flex gap-4 text-xs text-muted-foreground">
										{skill.cd > 0 && <span>CD: {skill.cd}s</span>}
										{skill.mana > 0 && <span>Mana: {skill.mana}</span>}
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Relationships Grid */}
			<div className="mb-6 grid gap-6 lg:grid-cols-3">
				{/* Strong Against */}
				{consolidated.relation.strong_against &&
					consolidated.relation.strong_against.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-green-500">Strong Against</CardTitle>
								<CardDescription>Heroes this hero counters</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{consolidated.relation.strong_against.map((relation, idx) => (
									<div key={idx}>
										<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
										<div className="grid grid-cols-3 gap-2">
											{relation.heroes.map((h) => (
												<div key={h.id} className="group relative aspect-square">
													<Image src={h.image} alt={h.name} fill className="object-cover" />
													<div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
														<span className="text-xs font-medium text-white">{h.name}</span>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}

				{/* Weak Against */}
				{consolidated.relation.weak_against && consolidated.relation.weak_against.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-red-500">Weak Against</CardTitle>
							<CardDescription>Heroes that counter this hero</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{consolidated.relation.weak_against.map((relation, idx) => (
								<div key={idx}>
									<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
									<div className="grid grid-cols-3 gap-2">
										{relation.heroes.map((h) => (
											<div key={h.id} className="group relative aspect-square">
												<Image src={h.image} alt={h.name} fill className="object-cover" />
												<div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
													<span className="text-xs font-medium text-white">{h.name}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}

				{/* Compatible With */}
				{consolidated.relation.compatible_with &&
					consolidated.relation.compatible_with.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-blue-500">Compatible With</CardTitle>
								<CardDescription>Heroes that synergize well</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{consolidated.relation.compatible_with.map((relation, idx) => (
									<div key={idx}>
										<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
										<div className="grid grid-cols-3 gap-2">
											{relation.heroes.map((h) => (
												<div key={h.id} className="group relative aspect-square">
													<Image src={h.image} alt={h.name} fill className="object-cover" />
													<div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
														<span className="text-xs font-medium text-white">{h.name}</span>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					)}
			</div>

			{/* Matchup Statistics */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Best Teammates */}
				{consolidated.most_compatible && consolidated.most_compatible.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Best Teammates</CardTitle>
							<CardDescription>Heroes with highest win rate together</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.most_compatible.slice(0, 5).map((teammate) => (
									<div
										key={teammate.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image
												src={teammate.image}
												alt={teammate.name}
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium">{teammate.name}</div>
											<div className="text-xs text-muted-foreground">
												Win: {(teammate.win_rate * 100).toFixed(1)}% • Pick:{" "}
												{(teammate.pick_rate * 100).toFixed(1)}%
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-green-500">
												+{(teammate.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Best Counters */}
				{consolidated.best_counter && consolidated.best_counter.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Countered By</CardTitle>
							<CardDescription>Heroes that counter this hero effectively</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.best_counter.slice(0, 5).map((counter) => (
									<div
										key={counter.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image src={counter.image} alt={counter.name} fill className="object-cover" />
										</div>
										<div className="flex-1">
											<div className="font-medium">{counter.name}</div>
											<div className="text-xs text-muted-foreground">
												Win: {(counter.win_rate * 100).toFixed(1)}% • Pick:{" "}
												{(counter.pick_rate * 100).toFixed(1)}%
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-red-500">
												{(counter.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Worst Matchups */}
				{consolidated.worst_counter && consolidated.worst_counter.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Best Against</CardTitle>
							<CardDescription>Heroes this hero performs well against</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.worst_counter.slice(0, 5).map((counter) => (
									<div
										key={counter.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image src={counter.image} alt={counter.name} fill className="object-cover" />
										</div>
										<div className="flex-1">
											<div className="font-medium">{counter.name}</div>
											<div className="text-xs text-muted-foreground">
												Win: {(counter.win_rate * 100).toFixed(1)}% • Pick:{" "}
												{(counter.pick_rate * 100).toFixed(1)}%
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-green-500">
												+{(counter.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Least Compatible */}
				{consolidated.least_compatible && consolidated.least_compatible.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Worst Teammates</CardTitle>
							<CardDescription>Heroes with lowest win rate together</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{consolidated.least_compatible.slice(0, 5).map((teammate) => (
									<div
										key={teammate.id}
										className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
									>
										<div className="relative h-12 w-12 shrink-0">
											<Image
												src={teammate.image}
												alt={teammate.name}
												fill
												className="object-cover"
											/>
										</div>
										<div className="flex-1">
											<div className="font-medium">{teammate.name}</div>
											<div className="text-xs text-muted-foreground">
												Win: {(teammate.win_rate * 100).toFixed(1)}% • Pick:{" "}
												{(teammate.pick_rate * 100).toFixed(1)}%
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm font-semibold text-red-500">
												{(teammate.increase_win_rate * 100).toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
