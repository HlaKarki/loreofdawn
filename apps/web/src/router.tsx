import { Link, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function NotFound() {
	return (
		<div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-2xl font-semibold">Not found</h1>
			<p className="text-sm text-muted-foreground">
				The page you are looking for does not exist.
			</p>
			<Link to="/" className="text-sm underline underline-offset-4">
				Back to home
			</Link>
		</div>
	);
}

export function getRouter() {
	return createRouter({
		routeTree,
		defaultStaleTime: 60_000,
		defaultPreload: "intent",
		scrollRestoration: true,
		defaultNotFoundComponent: NotFound,
	});
}
