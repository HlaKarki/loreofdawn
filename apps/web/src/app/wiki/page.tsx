import Link from "next/link";
import { makeUrl } from "@/lib/utils.api";
import type { MlHeroList } from "@repo/database";

type HeroSummary = {
	slug: string;
	title: string;
	pageId: number | string;
};

export const dynamic = "force-dynamic";
// export const revalidate = 300;

// export async function generateStaticParams() {
// 	// Pre-build top 30 heroes at build time
// 	const response = await fetch(makeUrl("/heroes/list/all"));
// 	const heroes = (await response.json()) as MlHeroList[];
// 	return heroes.slice(0, 10).map((h) => ({
// 		hero: h.url_name,
// 	}));
// }

export default async function WikiIndexPage() {
	const response = await fetch(`/api/heroes`);

	if (!response.ok) {
		throw new Error("Failed to load heroes");
	}

	const heroes = (await response.json()) as HeroSummary[];
	const sortedHeroes = heroes.sort((a, b) => a.title.localeCompare(b.title));

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Hero Wiki</h1>
				<p className="text-muted-foreground">
					Browse hero lore, abilities, and more. Select a hero to open their dedicated wiki page.
				</p>
			</header>
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{sortedHeroes.map((hero) => (
					<li key={hero.slug}>
						<Link
							href={`/wiki/${encodeURIComponent(hero.slug)}`}
							className="block rounded-lg border border-border bg-card px-4 py-3 transition hover:border-amber-500 hover:bg-card/80"
						>
							<span className="text-lg font-medium">{hero.title}</span>
							<span className="mt-1 block text-xs uppercase tracking-wide text-muted-foreground">
								{hero.slug}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
