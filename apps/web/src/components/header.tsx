"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/wiki", label: "Wikis" },
		{ to: "/hero", label: "Heroes" },
		{ to: "/login", label: "Login" },
	] as const;

	return (
		<header
			className={cn(
				"z-50 fixed inset-0 h-fit",
				"flex items-center justify-between px-2 py-4",
				"bg-background border-b border-b-accent",
			)}
		>
			<div className="flex gap-4 text-[1.1em]">
				{links.map(({ to, label }) => {
					return (
						<Link key={to} href={to} prefetch={true}>
							{label}
						</Link>
					);
				})}
			</div>
			<div className="flex items-center gap-2">
				<ModeToggle />
			</div>
		</header>
	);
}
