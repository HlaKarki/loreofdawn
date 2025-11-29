"use client";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

export default function Header() {
	const links = [
		{ to: "/wiki", label: "Wikis" },
		{ to: "/hero", label: "Heroes" },
		{ to: "/stats", label: "Stats" },
	] as const;

	return (
		<header
			className={cn(
				"z-50 fixed inset-0 h-fit",
				"flex items-center justify-between px-2 pb-4",
				"bg-background border-b border-b-accent",
			)}
		>
			<div className="flex items-end gap-4 text-[1.1em]">
				<a href="/" rel="preload">
					<img src="/logos/lod-white.svg" alt="logo" className="h-auto w-32" />
				</a>
				{links.map(({ to, label }) => {
					return (
						<a key={to} rel="prefetch" href={to} className="font-[500]">
							{label}
						</a>
					);
				})}
			</div>
			<div className="flex items-center gap-2">
				<UserButton />
			</div>
		</header>
	);
}
