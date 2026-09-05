import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lores")({
	component: LoreLayout,
});

function LoreLayout() {
	return (
		<main className="font-quicksand">
			<Outlet />
		</main>
	);
}
