"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { MlMetaSummary } from "@repo/database";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchIcon, LoaderIcon, TrendingUp, Target } from "lucide-react";
import Fuse from "fuse.js";
import { makeUrl } from "@/lib/utils.api";

const MAX_RESULTS = 8;

// Generate a consistent color based on hero name
const getAvatarColor = (name: string) => {
	const colors = [
		"bg-amber-500/20 text-amber-700 dark:text-amber-300",
		"bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
		"bg-sky-500/20 text-sky-700 dark:text-sky-300",
		"bg-violet-500/20 text-violet-700 dark:text-violet-300",
		"bg-rose-500/20 text-rose-700 dark:text-rose-300",
		"bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
	];
	const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return colors[hash % colors.length];
};

export function HeroSearch() {
	const [heroes, setHeroes] = useState<MlMetaSummary[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	// Fetch heroes on mount
	useEffect(() => {
		async function fetchHeroes() {
			setIsLoading(true);
			try {
				const response = await fetch(makeUrl("/v1/heroes/meta?name=all&rank=glory"));
				if (response.ok) {
					const data: MlMetaSummary[] = await response.json();
					setHeroes(data.sort((a, b) => a.name.localeCompare(b.name)));
				}
			} catch (error) {
				console.error("Failed to fetch heroes:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchHeroes();
	}, []);

	// Initialize Fuse.js
	const fuse = useMemo(() => {
		if (heroes.length === 0) return null;

		return new Fuse(heroes, {
			keys: ["display_name", "url_name", "name"],
			threshold: 0.3,
			distance: 100,
			minMatchCharLength: 1,
		});
	}, [heroes]);

	// Search results
	const results = useMemo(() => {
		if (!searchQuery.trim() || !fuse) return [];

		const searchResults = fuse.search(searchQuery);
		return searchResults.slice(0, MAX_RESULTS).map((result) => result.item);
	}, [searchQuery, fuse]);

	// Handle input change
	useEffect(() => {
		if (searchQuery.trim()) {
			setIsOpen(true);
			setSelectedIndex(0);
		} else {
			setIsOpen(false);
		}
	}, [searchQuery]);

	// Navigate to hero
	const navigateToHero = (hero: MlMetaSummary) => {
		router.push(`/heroes/${encodeURIComponent(hero.url_name)}?rank=overall`);
		setSearchQuery("");
		setIsOpen(false);
		inputRef.current?.blur();
	};

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen || results.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % results.length);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
				break;
			case "Enter":
				e.preventDefault();
				if (results[selectedIndex]) {
					navigateToHero(results[selectedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				inputRef.current?.blur();
				break;
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<div className="relative">
					<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						ref={inputRef}
						type="text"
						placeholder="Search heroes by name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						onFocus={() => searchQuery.trim() && setIsOpen(true)}
						className="h-12 rounded-xl border-border/60 bg-background pl-11 pr-4 text-base shadow-sm transition-shadow focus:shadow-md"
						disabled={isLoading}
					/>
					{isLoading && (
						<LoaderIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
					)}
				</div>
			</PopoverTrigger>

			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border-border/60 p-0 shadow-lg"
				align="start"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				{results.length > 0 ? (
					<ScrollArea className="max-h-[360px]">
						<div className="p-1">
							{results.map((hero, index) => {
								const winRate = hero.win_rate * 100;
								const isHighWinRate = winRate >= 52;
								const isHighBanRate = hero.ban_rate >= 0.15;

								return (
									<button
										key={hero.url_name}
										onClick={() => navigateToHero(hero)}
										className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
											index === selectedIndex
												? "bg-accent text-accent-foreground"
												: "hover:bg-accent/50"
										}`}
										onMouseEnter={() => setSelectedIndex(index)}
									>
										{/* Avatar with initial */}
										<div
											className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${getAvatarColor(hero.name)}`}
										>
											{hero.name.charAt(0).toUpperCase()}
										</div>

										{/* Hero info */}
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<span className="truncate font-medium">{hero.name}</span>
												{isHighBanRate && (
													<TrendingUp className="h-3.5 w-3.5 shrink-0 text-amber-500" />
												)}
												{isHighWinRate && (
													<Target className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
												)}
											</div>
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span className={isHighWinRate ? "text-emerald-600 dark:text-emerald-400" : ""}>
													{winRate.toFixed(1)}% WR
												</span>
												<span>{(hero.pick_rate * 100).toFixed(1)}% PR</span>
												<span className={isHighBanRate ? "text-amber-600 dark:text-amber-400" : ""}>
													{(hero.ban_rate * 100).toFixed(1)}% BR
												</span>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</ScrollArea>
				) : (
					<div className="px-4 py-8 text-center text-sm text-muted-foreground">
						No heroes found matching &quot;{searchQuery}&quot;
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
