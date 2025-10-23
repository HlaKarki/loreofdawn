"use client";

import { parseAsString, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

type TocItem = { slug: string; label: string };

// Constants
const SCROLL_OFFSET = 400;
const SCROLL_TIMEOUT_MS = 300;
const BOTTOM_THRESHOLD = 5;

// Helper functions
const headingLevel = (label: string) => label.match(/^#+/)?.[0].length ?? 1;
const sanitizeLabel = (label: string) => label.replace(/^#+\s*/, "");

const isNearBottom = (scrollY: number, viewportHeight: number, documentHeight: number) => {
	return scrollY + viewportHeight >= documentHeight - BOTTOM_THRESHOLD;
};

export const TableOfContents = ({ titles }: { titles: TocItem[] }) => {
	const [section, setSection] = useQueryState(
		"section",
		parseAsString.withDefault(titles[0]?.slug ?? ""),
	);

	const isScrollingRef = useRef(false);
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Find which section is currently visible
	const findCurrentSection = (): string => {
		const viewportHeight = window.innerHeight;
		const scrollY = window.scrollY;
		const documentHeight = document.documentElement.scrollHeight;

		// If at bottom of page, show last section
		if (isNearBottom(scrollY, viewportHeight, documentHeight)) {
			return titles[titles.length - 1]?.slug ?? section ?? titles[0]?.slug;
		}

		// Find the last section that's above the scroll offset
		for (let i = titles.length - 1; i >= 0; i--) {
			const title = titles[i];
			const element = document.getElementById(title.slug);
			if (!element) continue;

			const rect = element.getBoundingClientRect();
			if (rect.top <= SCROLL_OFFSET) {
				return title.slug;
			}
		}

		return section ?? titles[0]?.slug;
	};

	// Handle scroll events to update active section
	useEffect(() => {
		const handleScroll = () => {
			// Ignore scroll events during programmatic scrolling
			if (isScrollingRef.current) return;

			const currentSection = findCurrentSection();

			if (currentSection !== section) {
				setSection(currentSection, { history: "replace" }).catch(console.error);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [titles, section, setSection]);

	// Handle TOC item clicks
	const handleClick = async (slug: string) => {
		// Prevent scroll event handling during programmatic scrolling
		isScrollingRef.current = true;

		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		await setSection(slug, { history: "replace" });

		const element = document.getElementById(slug);
		if (!element) {
			isScrollingRef.current = false;
			return;
		}

		// Calculate scroll position
		const elementTop = element.getBoundingClientRect().top + window.scrollY;
		const viewportHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;
		const maxScroll = documentHeight - viewportHeight;

		let targetScroll = elementTop - SCROLL_OFFSET;

		// Don't scroll past the bottom of the page
		if (targetScroll > maxScroll) {
			targetScroll = maxScroll;
		}

		window.scrollTo({
			top: targetScroll,
			behavior: "instant",
		});

		// Re-enable scroll detection after a short delay
		scrollTimeoutRef.current = setTimeout(() => {
			isScrollingRef.current = false;
		}, SCROLL_TIMEOUT_MS);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	// Auto-scroll on mount
	useEffect(() => {
		handleClick(section).catch(console.error);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!titles.length) return null;

	return (
		<nav
			aria-label="Table of contents"
			className={cn(
				"sticky top-26 h-fit max-h-[calc(100vh-6rem)]",
				"flex flex-col gap-0 text-sm",
				"self-start",
				"hidden lg:flex",
			)}
		>
			{titles.map((title, index) => {
				const level = headingLevel(title.label);
				const displayLabel = sanitizeLabel(title.label);
				const isActive = title.slug === section;

				return (
					<button
						key={index}
						type="button"
						onClick={() => handleClick(title.slug)}
						className={cn("relative flex items-center pl-1 py-1 text-left w-full")}
						style={{ marginLeft: `${level * 12}px` }}
					>
						{isActive && (
							<motion.span
								layoutId="active-rail"
								style={{ marginLeft: `-${level * 12}px` }}
								className="absolute -left-[0.5px] top-0 bottom-0 w-[3px] bg-foreground rounded-full"
								transition={{ duration: 0.3, ease: "easeInOut" }}
							/>
						)}
						<span
							style={{ marginLeft: `-${level * 12}px` }}
							className="absolute left-0 top-0 bottom-0 w-[2px] bg-muted-foreground/30"
						/>
						<span
							className={cn(
								"truncate text-foreground/60",
								isActive && "text-foreground",
								"transition-colors duration-300 ease-in-out",
							)}
						>
							{displayLabel}
						</span>
					</button>
				);
			})}
		</nav>
	);
};
