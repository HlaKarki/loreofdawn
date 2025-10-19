"use client";

import { parseAsString, useQueryState } from "nuqs";
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

	const handleClick = async (slug: string) => {
		await setSection(slug, { history: "replace" });
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
