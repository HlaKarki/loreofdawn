"use client";

import { parseAsString, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

type TocItem = { slug: string; label: string };

/**
 * Counts "#" from a label
 */
const headingLevel = (label: string) => label.match(/^#+/)?.[0].length ?? 1;

/**
 * Removes "#" from the Titles
 */
const sanitizeLabel = (label: string) => label.replace(/^#+\s*/, "");
const SCROLL_OFFSET = 300;

export const TableOfContents = ({ titles }: { titles: TocItem[] }) => {
	const [section, setSection] = useQueryState(
		"section",
		parseAsString.withDefault(titles[0]?.slug ?? ""),
	);

	const isScrollingRef = useRef(false);
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (isScrollingRef.current) return;

			const vp_height = window.innerHeight;
			const scrollY = window.scrollY;
			const documentHeight = document.documentElement.scrollHeight;

			const isAtBottom = scrollY + vp_height >= documentHeight - 5;

			let currentSection = section ?? titles[0]?.slug;

			for (let i = 0; i < titles.length; i++) {
				const title = titles[i];
				const element = document.getElementById(title.slug);
				if (!element) continue;

				const rect = element.getBoundingClientRect();

				// Section header is above or at the threshold
				if (rect.top <= SCROLL_OFFSET) {
					// Check if this is the last section or if the next section is still below threshold
					const isLastSection = i === titles.length - 1;
					const nextElement = !isLastSection ? document.getElementById(titles[i + 1].slug) : null;
					const nextRect = nextElement?.getBoundingClientRect();

					// Set as current if it's the last section OR the next section hasn't reached threshold yet
					if (isLastSection || (nextRect && nextRect.top > SCROLL_OFFSET)) {
						currentSection = title.slug;
					}
				}
			}

			// Only apply bottom logic if we're truly at the bottom
			// and the current logic hasn't already set the last section
			if (isAtBottom && currentSection !== titles[titles.length - 1]?.slug) {
				currentSection = titles[titles.length - 1]?.slug;
			}

			if (currentSection !== section) {
				setSection(currentSection, { history: "replace" }).catch(console.error);
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [titles, section, setSection]);

	const handleClick = async (slug: string) => {
		// Set the flag to ignore scroll events
		isScrollingRef.current = true;

		// Clear any existing timeout
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		await setSection(slug, { history: "replace" });

		const element = document.getElementById(slug);
		if (!element) {
			isScrollingRef.current = false;
			return;
		}

		const elementTop = element.getBoundingClientRect().top + window.scrollY;
		const viewportHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;
		const elementHeight = element.offsetHeight;

		let targetScroll = elementTop - SCROLL_OFFSET;

		// For small sections near bottom: scroll to show the section header
		const maxScroll = documentHeight - viewportHeight;

		// If the section is small and near the bottom, adjust scrolling
		if (elementHeight < viewportHeight / 3 && targetScroll > maxScroll - viewportHeight / 2) {
			// Try to center small sections when possible
			targetScroll = Math.min(elementTop - viewportHeight / 3, maxScroll);
		} else if (targetScroll > maxScroll) {
			targetScroll = maxScroll;
		}

		window.scrollTo({
			top: targetScroll,
			behavior: "instant",
		});

		// Re-enable scroll detection after animation completes
		scrollTimeoutRef.current = setTimeout(() => {
			isScrollingRef.current = false;
		}, 300);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	// first time autoscroll
	useEffect(() => {
		handleClick(section).catch(console.error);
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
			{titles.map((t, idx) => {
				const level = headingLevel(t.label);
				const displayLabel = sanitizeLabel(t.label);
				const active = t.slug === section;

				return (
					<button
						key={idx}
						type="button"
						onClick={() => handleClick(t.slug)}
						className={cn("relative flex items-center pl-1 py-1 text-left w-full")}
						style={{ marginLeft: `${level * 12}px` }}
					>
						{active && (
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
								active && "text-foreground",
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
