"use client";

import { parseAsString, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

type TocItem = { slug: string; label: string };

/**
 * Counts "#" from a label
 */
const headingLevel = (label: string) => label.match(/^#+/)?.[0].length ?? 1;

/**
 * Removes "#" from the Titles
 */
const sanitizeLabel = (label: string) => label.replace(/^#+\s*/, "");

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
				"sticky top-24 h-fit max-h-[calc(100vh-6rem)]",
				"flex flex-col gap-0 text-sm",
				"self-start",
				"hidden lg:flex",
			)}
		>
			{titles.map((t, idx) => {
				const level = headingLevel(t.label);
				const displayLabel = sanitizeLabel(t.label);
				const active = t.slug === section;
				let frontIndent = false;
				let backIndent = false;
				if (idx < titles.length - 1) {
					const nextLevel = headingLevel(titles[idx + 1].label);
					frontIndent = level < nextLevel;
					backIndent = level > nextLevel;
				}

				return (
					<button
						key={idx}
						type="button"
						onClick={() => handleClick(t.slug)}
						className={cn(
							"group relative flex items-center gap-2 rounded pl-3 py-1 text-left w-full",
							(frontIndent || backIndent) && "mb-[13px]",

							// vertical rail
							"before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0",
							"before:w-px before:rounded-full",
							active
								? "before:bg-amber-600"
								: "before:bg-muted-foreground/30 group-hover:before:bg-muted",

							// front elbow
							frontIndent &&
								"after:content-[''] after:absolute after:-left-[1.9px] after:top-[33.8px]",
							frontIndent && "after:w-[20.5px] after:h-px after:bg-muted-foreground/30",
							frontIndent && "after:rounded-full",
							frontIndent && "after:rotate-[40deg]",

							// back elbow
							backIndent &&
								"after:content-[''] after:absolute after:-left-[17.9px] after:top-[33.85px]",
							backIndent && "after:w-[20.5px] after:h-px after:bg-muted-foreground/30",
							backIndent && "after:rounded-full",
							backIndent && "after:-rotate-[40deg]",
						)}
						style={{ marginLeft: `${level * 16}px` }}
					>
						<span className={cn("truncate", active && "text-foreground font-medium")}>
							{displayLabel}
						</span>
					</button>
				);
			})}
		</nav>
	);
};
