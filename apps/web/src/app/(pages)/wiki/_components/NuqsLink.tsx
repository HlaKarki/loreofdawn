"use client";

import { parseAsString, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NuqsLinkProps {
	section: string;
	children: ReactNode;
	className?: string;
}

export const NuqsLink = ({ section, children, className }: NuqsLinkProps) => {
	const [_, setSection] = useQueryState("section", parseAsString);

	const handleClick = async () => {
		await setSection(section, { history: "replace" });
		document.getElementById(section)?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	return (
		<button onClick={handleClick} className={cn(className, "cursor-pointer")} type="button">
			{children}
		</button>
	);
};
