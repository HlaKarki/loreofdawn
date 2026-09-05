import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
			<div className="text-center">
				<h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
					Lore of Dawn
				</h1>
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Button asChild size="lg">
						<a href="/heroes">Heroes</a>
					</Button>
					<Button asChild size="lg" variant="secondary">
						<a href="/lores">Lores</a>
					</Button>
					<Button asChild size="lg" variant="secondary">
						<a href="/stats">Stats</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
