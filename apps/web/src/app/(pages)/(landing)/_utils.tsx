import type { ConsolidatedHeroOptional } from "@repo/database";

export function getTimeAgo(data: ConsolidatedHeroOptional[]): string | undefined {
	let date: Date;
	if (!data.length) return "";

	if (data[0].meta?.updatedAt) {
		date = new Date(data[0].meta?.updatedAt);
	} else {
		date = new Date(data[0].profile.updatedAt);
	}

	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
	let seconds = (date.getTime() - Date.now()) / 1000;

	const units: [Intl.RelativeTimeFormatUnit, number][] = [
		["year", 31536000],
		["month", 2592000],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["minute", 60],
		["second", 1],
	];

	for (const [unit, amount] of units) {
		if (Math.abs(seconds) >= amount || unit === "second") {
			return rtf.format(Math.round(seconds / amount), unit);
		}
	}
}

export function UpdatedAtLabel({ date }: { date: number }) {
	return (
		<p className="text-xs text-muted-foreground">
			Updated{" "}
			<time dateTime={new Date(date).toISOString()}>
				{new Date(date).toLocaleString(undefined, {
					month: "short",
					day: "numeric",
					hour: "numeric",
					minute: "2-digit",
				})}
			</time>
		</p>
	);
}
