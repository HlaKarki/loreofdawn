"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
	{ to: "/", label: "Home" },
	// { to: "/wiki", label: "Wikis" },
	{ to: "/lores", label: "Lores" },
	{ to: "/hero", label: "Heroes" },
	{ to: "/stats", label: "Stats" },
	{ to: "/meta", label: "Meta" },
];

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const headerRef = useRef<HTMLElement>(null);

	// Close mobile menu on outside click
	useEffect(() => {
		if (!mobileMenuOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (headerRef.current && !headerRef.current.contains(target)) {
				setMobileMenuOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [mobileMenuOpen]);

	// Close mobile menu on Escape key
	useEffect(() => {
		if (!mobileMenuOpen) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setMobileMenuOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [mobileMenuOpen]);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileMenuOpen]);

	return (
		<header
			ref={headerRef}
			className={cn(
				"fixed inset-x-0 top-0 z-50",
				"border-b border-border/60",
				"bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
			)}
		>
			{/* Inner wrapper with horizontal padding + max width */}
			<div
				className={cn(
					"mx-auto flex h-16 max-w-6xl items-center justify-between gap-3",
					"px-3 sm:px-4 lg:px-6",
				)}
			>
				{/* Left: Logo + Brand */}
				<div className="flex items-center gap-3">
					<a href="/" aria-label="Lore of Dawn Home" className="flex items-center gap-2">
						<img
							src="/logos/lod-white.svg"
							alt="LoreOfDawn logo"
							className="h-7 w-auto sm:h-8"
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					</a>
				</div>

				{/* Desktop Nav */}
				<nav className="hidden -translate-x-1/8 items-center gap-6 text-sm font-medium sm:flex">
					{links.map(({ to, label }) => {
						const isActive = to === "/" ? pathname === "/" : (pathname?.startsWith(to) ?? false);

						return (
							<a
								key={to}
								href={to}
								className={cn(
									"relative transition-colors",
									"text-muted-foreground hover:text-foreground",
									isActive && "text-foreground",
								)}
								suppressHydrationWarning
							>
								{label}
								<span
									className={cn(
										"pointer-events-none absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-primary",
										"origin-left scale-x-0 opacity-0 transition-opacity duration-200",
										isActive && "scale-x-100 opacity-100",
									)}
									suppressHydrationWarning
								/>
							</a>
						);
					})}
				</nav>

				{/* Right: User + Mobile toggle */}
				<div className="flex items-center gap-2">
					{/* Desktop user profile - reserved space even when empty */}
					<div className="hidden sm:flex items-center">
						<div className="w-[36px] h-[36px] flex items-center justify-center">
							<UserButton />
						</div>
					</div>

					{/* Mobile: user + burger */}
					<div className="flex items-center gap-2 sm:hidden">
						{/* Reserved space for mobile user button */}
						<div className="w-[32px] h-[32px] flex items-center justify-center">
							<UserButton />
						</div>

						<button
							type="button"
							className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70"
							onClick={() => setMobileMenuOpen((open) => !open)}
							aria-label="Toggle navigation"
							aria-expanded={mobileMenuOpen}
						>
							{/* Two-line burger that animates into an X */}
							<div className="flex flex-col items-center justify-center gap-[5px]">
								<span
									className={cn(
										"block h-0.5 w-5 rounded-full bg-foreground transition-transform duration-200",
										mobileMenuOpen && "translate-y-[3px] rotate-45",
									)}
								/>
								<span
									className={cn(
										"block h-0.5 w-5 rounded-full bg-foreground transition-transform duration-200",
										mobileMenuOpen && "-translate-y-[3px] -rotate-45",
									)}
								/>
							</div>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile nav panel */}
			<nav
				className={cn(
					"sm:hidden overflow-hidden transition-all duration-200 ease-out",
					"border-t border-border/60 bg-background/95 backdrop-blur",
					mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-0",
				)}
			>
				<div className="mx-auto flex max-w-6xl flex-col gap-1 px-3 pb-3 pt-2">
					{links.map(({ to, label }) => {
						const isActive = to === "/" ? pathname === "/" : (pathname?.startsWith(to) ?? false);

						return (
							<a
								key={to}
								href={to}
								onClick={() => setMobileMenuOpen(false)}
								className={cn(
									"rounded-md px-2 py-2 text-sm font-medium",
									"flex items-center justify-between",
									"transition-colors",
									"hover:bg-accent/70",
									isActive ? "bg-accent text-foreground" : "text-muted-foreground",
								)}
								suppressHydrationWarning
							>
								<span>{label}</span>
							</a>
						);
					})}
				</div>
			</nav>
		</header>
	);
}
