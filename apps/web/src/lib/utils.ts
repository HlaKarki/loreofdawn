import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type TidyOptions = {
	/** words to keep lowercase unless first/last */
	minorWords?: Set<string>;
	forceUpper?: Set<string>;
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

	const text = s.replace(/_/g, " ").replace(/\s+/g, " ").trim();
	if (!text) return "";

	const words = text.split(" ");

	const cap = (w: string) => {
		return w
			.split("'")
			.map((chunk, i) =>
				chunk
					? chunk.charAt(0).toLocaleUpperCase(locale) + chunk.slice(1).toLocaleLowerCase(locale)
					: i === 0
						? ""
						: "",
			)
			.join("'")
			.split("-")
			.map((h) =>
				h ? h.charAt(0).toLocaleUpperCase(locale) + h.slice(1).toLocaleLowerCase(locale) : "",
			)
			.join("-");
	};

	const isAcronymish = (w: string) => /^[A-Z0-9]{2,}$/.test(w);
	const canon = (w: string) => w.toLocaleLowerCase(locale);

	return words
		.map((raw, idx) => {
			const first = idx === 0;
			const last = idx === words.length - 1;

			for (const fu of forceUpper) {
				if (canon(raw) === fu.toLocaleLowerCase(locale)) return fu;
			}

			if (isAcronymish(raw)) return raw.toUpperCase();

			const lowered = canon(raw);

			if (!first && !last && minor.has(lowered)) {
				return lowered;
			}

			return cap(raw);
		})
		.join(" ");
}
