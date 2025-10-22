"use client";

import type { MlGraphData } from "@repo/database";
import {
	AreaChart,
	XAxis,
	YAxis,
	Tooltip,
	Area,
	CartesianGrid,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";
import React from "react";

type Metric = "win_rate" | "ban_rate" | "pick_rate";

const CHART_CONFIG: Record<Metric, { label: string; colorVar: string; gradientId: string }> = {
	win_rate: { label: "Win Rate", colorVar: "var(--chart-2)", gradientId: "grad-win" },
	ban_rate: { label: "Ban Rate", colorVar: "var(--chart-3)", gradientId: "grad-ban" },
	pick_rate: { label: "Pick Rate", colorVar: "var(--chart-1)", gradientId: "grad-pick" },
};

function pct(n: number, digits = 2) {
	return `${(n * 100).toFixed(digits)}%`;
}

function computeStats(series: number[]) {
	const min = Math.min(...series);
	const max = Math.max(...series);
	const mean = series.reduce((a, b) => a + b, 0) / series.length;
	const range = Math.max(1e-9, max - min);
	return { min, max, mean, range };
}

function nicePaddedDomain(min: number, max: number, pad = 0.15): [number, number] {
	const r = Math.max(1e-9, max - min);
	const p = r * pad;
	// clamp to [0,1] for probabilities
	return [Math.max(0, min - p), Math.min(1, max + p)] as [number, number];
}

function formatXAxisDate(d: string) {
	// "2025-10-03" -> "Oct 3"
	const dt = new Date(d + "T00:00:00Z");
	return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const HeroGraph: React.FC<{ data: MlGraphData }> = ({ data }) => {
	const [metric, setMetric] = React.useState<Metric>("win_rate");

	const points = React.useMemo(() => {
		// shallow copy to avoid mutating props; ensure numbers
		return data.points.map((p) => ({
			...p,
			win_rate: Number(p.win_rate),
			ban_rate: Number(p.ban_rate),
			pick_rate: Number(p.pick_rate),
		}));
	}, [data.points]);

	const { min, max, mean } = React.useMemo(() => {
		const series = points.map((p) => p[metric]);
		return computeStats(series);
	}, [points, metric]);

	const yDomain: [number, number] = React.useMemo(() => {
		return nicePaddedDomain(min, max, 0.25); // extra padding to make micro-variance visible
	}, [metric, min, max]);

	const colorVar = CHART_CONFIG[metric].colorVar;
	const gradId = CHART_CONFIG[metric].gradientId;

	return (
		<div className="mt-6 md:mt-10 rounded-xl md:rounded-2xl border border-border/60 p-3 md:p-6 select-none">
			{/* Header + Controls */}
			<div className="mb-3 md:mb-4 flex flex-col gap-2 md:gap-3">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h3 className="text-base md:text-lg font-semibold">{CHART_CONFIG[metric].label} over time</h3>
						<p className="text-xs md:text-sm text-muted-foreground">
							{new Date(data.trend_start!).toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
							{new Date(data.trend_end!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-1.5 md:gap-2">
					{/* Metric switcher */}
					{(["win_rate", "ban_rate", "pick_rate"] as Metric[]).map((m) => (
						<button
							key={m}
							onClick={() => setMetric(m)}
							className={[
								"rounded-lg md:rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border",
								metric === m
									? "bg-primary/10 border-primary/40"
									: "bg-card hover:bg-accent border-border/60",
							].join(" ")}
						>
							{CHART_CONFIG[m].label}
						</button>
					))}
				</div>
			</div>

			{/* Chart */}
			<div className="h-[240px] md:h-[320px] w-full">
				<ResponsiveContainer>
					<AreaChart data={points} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
						<defs>
							<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={colorVar} stopOpacity={0.38} />
								<stop offset="95%" stopColor={colorVar} stopOpacity={0.06} />
							</linearGradient>
						</defs>

						<CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.35} />

						<XAxis
							dataKey="date"
							tickFormatter={formatXAxisDate}
							minTickGap={28}
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 11 }}
						/>

						<YAxis
							domain={yDomain}
							tickFormatter={(v) => pct(v, v < 0.1 ? 3 : 2)}
							tickLine={false}
							axisLine={false}
							width={48}
							tick={{ fontSize: 11 }}
						/>

						{/* mean reference line */}
						<ReferenceLine y={mean} stroke="currentColor" strokeDasharray="4 4" opacity={0.35} />

						<Tooltip
							wrapperStyle={{ outline: "none" }}
							content={({ active, payload, label }) => {
								if (!active || !payload?.length) return null;
								const val = payload[0].value as number;
								const idx = points.findIndex((p) => p.date === label);
								const prev = idx > 0 ? points[idx - 1][metric] : undefined;
								const delta = prev !== undefined ? val - prev : undefined;

								return (
									<div className="rounded-lg md:rounded-xl border border-border/60 bg-popover p-2 md:p-3 shadow-lg">
										<div className="mb-0.5 md:mb-1 text-[10px] md:text-xs text-muted-foreground">
											{formatXAxisDate(label)}
										</div>
										<div className="flex items-baseline gap-1.5 md:gap-2">
											<span className="text-xs md:text-sm">{CHART_CONFIG[metric].label}:</span>
											<span className="text-sm md:text-base font-semibold">{pct(val, val < 0.1 ? 3 : 2)}</span>
										</div>
										{delta !== undefined && (
											<div className="mt-0.5 md:mt-1 text-[10px] md:text-xs">
												Δ day:{" "}
												<span className={delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
													{delta >= 0 ? "+" : ""}
													{pct(delta, Math.abs(delta) < 0.01 ? 3 : 2)}
												</span>
											</div>
										)}
									</div>
								);
							}}
						/>

						<Area
							type="monotone"
							dataKey={metric}
							stroke={colorVar}
							fill={`url(#${gradId})`}
							strokeWidth={2}
							dot={false}
							activeDot={{ r: 3 }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			{/* Tiny legend with current range context */}
			<div className="mt-2 md:mt-3 flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground">
				<div className="inline-block h-1.5 md:h-2 w-1.5 md:w-2 rounded-full" style={{ background: colorVar }} />
				<span>
					Range: <strong>{pct(yDomain[0])}</strong> – <strong>{pct(yDomain[1])}</strong>
				</span>
			</div>
		</div>
	);
};
