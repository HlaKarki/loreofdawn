"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type TocItem = { slug: string; label: string };

const headingLevel = (label: string) => label.match(/^#+/)?.[0].length ?? 1;
const sanitizeLabel = (label: string) => label.replace(/^#+\s*/, "");

const basePadding = 8;
const indentPerLevel = 12;
const indentStyle = (level: number) => ({
	paddingLeft: `${basePadding + (level - 1) * indentPerLevel}px`,
});

export const TableOfContents = ({ titles }: { titles: TocItem[] }) => {

	const [section, setSection] = useQueryState(
		"section",
		parseAsString.withDefault(titles[0]?.slug ?? ""),
	);

	// Keep section valid if titles change
	useEffect(() => {
		if (!titles.length) return;
		if (!titles.some((t) => t.slug === section)) {
			setSection(titles[0].slug, { history: "replace" });
		}
	}, [titles, section, setSection]);

	// Auto-highlight section on scroll
	useEffect(() => {
		if (!titles.length) return;

		const onScroll = () => {
			const offset = 96; // adjust for sticky header height
			const scrollY = window.scrollY + offset;

			// find the last heading that has passed
			let current = titles[0].slug;
			for (const t of titles) {
				const el = document.getElementById(t.slug);
				if (el && el.offsetTop <= scrollY) {
					current = t.slug;
				} else {
					break;
				}
			}
			if (current !== section) {
				setSection(current, { history: "replace" });
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll(); // run once on mount
		return () => window.removeEventListener("scroll", onScroll);
	}, [titles, section, setSection]);

	const handleClick = (slug: string) => {
		setSection(slug, { history: "replace" });
		document.getElementById(slug)?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	if (!titles.length) return null;

	return (
		<nav
			aria-label="Table of contents"
			className={cn(
				"sticky top-24 flex h-fit max-h-[calc(100vh-6rem)] w-60 flex-col gap-2 overflow-y-auto text-sm",
				"self-start",
				"hidden lg:flex",
			)}
		>
			{titles.map((t) => {
				const level = headingLevel(t.label);
				const displayLabel = sanitizeLabel(t.label);

				return (
					<button
						key={t.slug}
						type="button"
						onClick={() => handleClick(t.slug)}
						className={cn(
							"rounded px-2 py-1 text-left transition-colors",
							t.slug === section
								? "bg-amber-600 text-white"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
						style={indentStyle(level)}
					>
						{displayLabel}
					</button>
				);
			})}
		</nav>
	);
};
