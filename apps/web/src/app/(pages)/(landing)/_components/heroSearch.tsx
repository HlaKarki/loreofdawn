"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { MlMetaSummary } from "@repo/database";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchIcon, LoaderIcon } from "lucide-react";
import Fuse from "fuse.js";
import { makeUrl } from "@/lib/utils.api";

const MAX_RESULTS = 7;
const DEBOUNCE_MS = 300;

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
				const response = await fetch(makeUrl("/v1/heroes/meta?name=all"));
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
			keys: ["display_name", "url_name"],
			threshold: 0.3, // More lenient matching for typos
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

	// Handle input change with debouncing
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
		router.push(`/hero/${encodeURIComponent(hero.name)}?rank=overall`);
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
		<div className="mb-8">
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<div className="relative">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
						<Input
							ref={inputRef}
							type="text"
							placeholder="Search heroes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							onFocus={() => searchQuery.trim() && setIsOpen(true)}
							className="pl-10 pr-10 h-12 text-base"
							disabled={isLoading}
						/>
						{isLoading && (
							<LoaderIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
						)}
					</div>
				</PopoverTrigger>

				<PopoverContent
					className="p-0 w-[var(--radix-popover-trigger-width)]"
					align="start"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					{results.length > 0 ? (
						<ScrollArea className="max-h-[400px]">
							<div className="py-2">
								{results.map((hero, index) => (
									<button
										key={hero.id}
										onClick={() => navigateToHero(hero)}
										className={`w-full px-4 py-3 text-left transition-colors ${
											index === selectedIndex
												? "bg-accent text-accent-foreground"
												: "hover:bg-accent/50"
										}`}
										onMouseEnter={() => setSelectedIndex(index)}
									>
										<div className="font-medium">{hero.name}</div>
										<div className="text-xs text-muted-foreground mt-0.5">{hero.name}</div>
									</button>
								))}
							</div>
						</ScrollArea>
					) : (
						<div className="py-8 text-center text-sm text-muted-foreground">No heroes found</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
