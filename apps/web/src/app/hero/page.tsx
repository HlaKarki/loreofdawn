import Link from "next/link";

type HeroSummary = {
	slug: string;
	title: string;
	pageId: number | string;
};

export const dynamic = "force-dynamic";

export default async function HeroesPage() {
	const response = await fetch(`/api/heroes/list`, {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to load heroes");
	}

	const heroes = (await response.json()) as HeroSummary[];
	const sortedHeroes = heroes.sort((a, b) => a.title.localeCompare(b.title));

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Heroes</h1>
				<p className="text-muted-foreground">Browse latest hero stats, counters and more</p>
			</header>
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{sortedHeroes.map((hero) => (
					<li key={hero.slug}>
						<Link
							href={`/hero/${encodeURIComponent(hero.slug)}`}
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
