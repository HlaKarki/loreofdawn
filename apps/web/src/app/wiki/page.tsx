import Link from "next/link";
import { makeUrl } from "@/lib/utils.api";
import type { MlHeroList } from "@repo/database";

export const dynamic = "force-dynamic";

export default async function WikiIndexPage() {
	const response = await fetch(makeUrl("/v1/heroes/list"));

	if (!response.ok) {
		throw new Error("Failed to load heroes");
	}

	const heroes = (await response.json()) as MlHeroList[];
	const sortedHeroes = heroes.sort((a, b) => a.display_name.localeCompare(b.display_name));

	return (
		<div className=" mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Hero Wiki</h1>
				<p className="text-muted-foreground">
					Browse hero lore, abilities, and more. Select a hero to open their dedicated wiki page.
				</p>
			</header>
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{sortedHeroes.map((hero) => (
					<li key={hero.url_name}>
						<Link
							href={`/wiki/${encodeURIComponent(hero.url_name)}`}
							className="block rounded-lg border border-border bg-card px-4 py-3 transition hover:border-amber-500 hover:bg-card/80"
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
