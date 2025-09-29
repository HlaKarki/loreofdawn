import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function slugify(word: string) {
	return word
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\s*[–—/]\s*/g, "§§") // treat em/en dash OR slash as double dash; eat surrounding spaces
		.replace(/[()]/g, "") // drop parentheses
		.replace(/\s+/g, "-") // remaining spaces -> "-"
		.replace(/[^a-z0-9\-§]/g, "") // drop other punctuation
		.replace(/-+/g, "-") // collapse runs of "-"
		.replace(/§§/g, "--") // restore double hyphen
		.replace(/^-+|-+$/g, ""); // trim edges
}
