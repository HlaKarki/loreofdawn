"use client";

import { parseAsString, useQueryState } from "nuqs";
import { type CSSProperties, useEffect } from "react";
import { cn } from "@/lib/utils";

type TocItem = { slug: string; label: string };

const headingLevel = (label: string) => {
	const match = label.match(/^#+/);
	return match ? match[0].length : 1;
};

const sanitizeLabel = (label: string) => label.replace(/^#+\s*/, "");

const basePadding = 8;
const indentPerLevel = 12; // px offset for nested headings

const indentStyle = (level: number): CSSProperties => ({
	paddingLeft: `${basePadding + Math.max(0, level - 1) * indentPerLevel}px`,
});

export const TableOfContents = ({ titles }: { titles: TocItem[] }) => {
	const [section, setSection] = useQueryState(
		"section",
		parseAsString.withDefault(titles[0]?.slug ?? ""),
	);

	// Ensure section is always valid when items change
	useEffect(() => {
		if (!titles.length) return;
		if (!titles.some((i) => i.slug === section)) {
			setSection(titles[0].slug, { history: "replace" });
		}
	}, [titles, section]);

	// Scroll whenever section changes
	useEffect(() => {
		if (!section) return;
		const el = document.getElementById(section);
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [section]);

	if (!titles.length) {
		return null;
	}

	return (
		<nav
			aria-label="Table of contents"
			className={cn(
				"sticky top-24 flex h-fit max-h-[calc(100vh-6rem)] w-60 flex-col gap-2 overflow-y-auto text-sm",
				"self-start",
			)}
		>
			{titles.map((title) => {
				const level = headingLevel(title.label);
				const displayLabel = sanitizeLabel(title.label);
				const style = indentStyle(level);

				return (
					<button
						key={title.slug}
						type="button"
						onClick={() => setSection(title.slug, { history: "replace" })}
						className={cn(
							"rounded px-2 py-1 text-left transition-colors",
							title.slug === section
								? "bg-amber-600 text-white"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
						style={style}
					>
						{displayLabel}
					</button>
				);
			})}
		</nav>
	);
};
