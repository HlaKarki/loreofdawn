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

type TidyOptions = {
	/** words to keep lowercase unless first/last */
	minorWords?: Set<string>;
	/** words to always uppercase (e.g., acronyms) */
	forceUpper?: Set<string>;
	/** locale for case conversions */
	locale?: string;
};

const DEFAULT_MINOR = new Set([
	"a",
	"an",
	"the",
	"and",
	"but",
	"or",
	"nor",
	"for",
	"so",
	"yet",
	"at",
	"by",
	"in",
	"of",
	"on",
	"to",
	"up",
	"via",
	"vs",
	"with",
	"as",
	"per",
	"from",
]);

export function tidyLabel(s: string, opts: TidyOptions = {}): string {
	const locale = opts.locale ?? "en-US";
	const minor = opts.minorWords ?? DEFAULT_MINOR;
	const forceUpper = opts.forceUpper ?? new Set<string>(["API", "MLBB", "AI", "ID"]);

	// Normalize: underscores -> spaces, collapse whitespace
	const text = s.replace(/_/g, " ").replace(/\s+/g, " ").trim();
	if (!text) return "";

	const words = text.split(" ");

	const cap = (w: string) => {
		// Preserve all-digit or mixed tokens as-is except first letter title-cased
		// Handle apostrophes: D'Artagnan, O'clock
		return (
			w
				.split("'")
				.map(
					(chunk, i) =>
						chunk
							? chunk.charAt(0).toLocaleUpperCase(locale) + chunk.slice(1).toLocaleLowerCase(locale)
							: i === 0
								? ""
								: "", // keep empty segments
				)
				.join("'")
				// Then handle hyphenations inside the chunk: state-of-the-art -> State-of-the-Art (minor rule still below)
				.split("-")
				.map((h) =>
					h ? h.charAt(0).toLocaleUpperCase(locale) + h.slice(1).toLocaleLowerCase(locale) : "",
				)
				.join("-")
		);
	};

	const isAcronymish = (w: string) => /^[A-Z0-9]{2,}$/.test(w);
	const canon = (w: string) => w.toLocaleLowerCase(locale);

	return words
		.map((raw, idx) => {
			const first = idx === 0;
			const last = idx === words.length - 1;

			// Respect forced uppercase (match case-insensitively)
			for (const fu of forceUpper) {
				if (canon(raw) === fu.toLocaleLowerCase(locale)) return fu;
			}

			// Keep existing acronyms (USA, API, MLBB) uppercase
			if (isAcronymish(raw)) return raw.toUpperCase();

			const lowered = canon(raw);

			// Minor-words rule (unless first/last)
			if (!first && !last && minor.has(lowered)) {
				return lowered;
			}

			// Title-case with apostrophes and hyphens handled
			return cap(raw);
		})
		.join(" ");
}
