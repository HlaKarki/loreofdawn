"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export const TableOfContents = ({ titles }: { titles: (string | undefined)[] }) => {
	const [section, setSection] = useQueryState(
		"section",
		parseAsString.withDefault(titles[0] ?? ""),
	);

	// Ensure section is always valid when items change
	useEffect(() => {
		if (!titles.length) return;
		if (!titles.some((i) => i === section)) {
			setSection(titles[0]!, { history: "replace" });
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
		<nav aria-label="Table of contents" className="flex flex-col gap-2 text-sm">
			{titles.map((title) => (
				<button
					key={title}
					type="button"
					onClick={() => setSection(title!, { history: "push" })}
					className={cn(
						"rounded px-2 py-1 text-left transition-colors",
						title === section
							? "bg-amber-600 text-white"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					{title}
				</button>
			))}
		</nav>
	);
};
