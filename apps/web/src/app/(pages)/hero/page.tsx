import Link from "next/link";
import type { MlHeroList } from "@repo/database";
import { makeUrl } from "@/lib/utils.api";

export const dynamic = "force-dynamic";

export default async function HeroesPage() {
	const response = await fetch(makeUrl("/v1/heroes/list"));

	if (!response.ok) {
		throw new Error("Failed to load heroes");
	}

	const heroes = (await response.json()) as MlHeroList[];
	const sortedHeroes = heroes.sort((a, b) => a.display_name.localeCompare(b.display_name));

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-16 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Heroes</h1>
				<p className="text-muted-foreground">Browse latest hero stats, counters and more</p>
			</header>
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{sortedHeroes.map((hero) => (
					<li key={hero.url_name}>
						<Link
							href={`/hero/${encodeURIComponent(hero.url_name)}?rank=overall`}
							className="block rounded-lg border border-border bg-card px-4 py-3 transition hover:border-amber-500 hover:bg-card/80"
							prefetch={true}
						>
							<span className="text-lg font-medium">{hero.display_name}</span>
							<span className="mt-1 block text-xs uppercase tracking-wide text-muted-foreground">
								{hero.url_name}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
