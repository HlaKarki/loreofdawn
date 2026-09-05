"use client";

import type { MlGraphData } from "@repo/database";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import React from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
	return [Math.max(0, min - p), Math.min(1, max + p)] as [number, number];
}

function formatXAxisDate(d: string) {
	const dt = new Date(d + "T00:00:00Z");
	return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const HeroGraph: React.FC<{ data: MlGraphData }> = ({ data }) => {
	// Single by default: only one metric selected initially
	const [selectedMetrics, setSelectedMetrics] = React.useState<Metric[]>(["win_rate"]);
	const [multi, setMulti] = React.useState(false);

	const toggleMetric = (metric: Metric) => {
		if (!multi) {
			// Single-select mode: always switch to the clicked metric
			setSelectedMetrics([metric]);
			return;
		}
		// Multi-select mode (max 2)
		setSelectedMetrics((prev) => {
			if (prev.includes(metric)) {
				// If removing would leave none, keep one
				return prev.length > 1 ? prev.filter((m) => m !== metric) : prev;
			}
			// Add if room, else replace the second slot for quick compare
			if (prev.length < 2) return [...prev, metric];
			return [prev[0], metric];
		});
	};

	const [leftMetric, rightMetric] = selectedMetrics;
	const isDualAxis = multi && selectedMetrics.length === 2;

	const points = React.useMemo(() => {
		return data.points.map((p) => ({
			...p,
			win_rate: Number(p.win_rate),
			ban_rate: Number(p.ban_rate),
			pick_rate: Number(p.pick_rate),
		}));
	}, [data.points]);

	const leftStats = React.useMemo(() => {
		const series = points.map((p) => p[leftMetric]);
		return computeStats(series);
	}, [points, leftMetric]);

	const rightStats = React.useMemo(() => {
		if (!isDualAxis || !rightMetric) return leftStats;
		const series = points.map((p) => p[rightMetric]);
		return computeStats(series);
	}, [points, rightMetric, isDualAxis, leftStats]);

	const leftDomain: [number, number] = React.useMemo(
		() => nicePaddedDomain(leftStats.min, leftStats.max, 0.25),
		[leftStats.min, leftStats.max],
	);
	const rightDomain: [number, number] = React.useMemo(
		() => nicePaddedDomain(rightStats.min, rightStats.max, 0.25),
		[rightStats.min, rightStats.max],
	);

	const leftColorVar = CHART_CONFIG[leftMetric].colorVar;
	const leftGradId = CHART_CONFIG[leftMetric].gradientId;
	const rightColorVar = rightMetric ? CHART_CONFIG[rightMetric].colorVar : leftColorVar;
	const rightGradId = rightMetric ? CHART_CONFIG[rightMetric].gradientId : leftGradId;

	return (
		<div className="mt-6 md:mt-10 rounded-xl md:rounded-2xl border border-border/60 p-3 md:p-6 select-none">
			{/* Header + Controls */}
			<div className="mb-3 md:mb-4 flex flex-col gap-2 md:gap-3">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h3 className="text-base md:text-lg font-semibold">
							{isDualAxis ? "Metrics Comparison" : `${CHART_CONFIG[leftMetric].label} over time`}
						</h3>
						<p className="text-xs md:text-sm text-muted-foreground">
							{new Date(data.trend_start!).toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}{" "}
							–{" "}
							{new Date(data.trend_end!).toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}
						</p>
					</div>

					{/* Multi toggle */}
					<div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs shadow-sm md:px-3 md:text-sm">
						<Switch
							id="hero-multi-toggle"
							checked={multi}
							onCheckedChange={(checked) => {
								setMulti(checked);
								if (!checked) {
									setSelectedMetrics((prev) => (prev.length ? [prev[0]] : ["win_rate"]));
								}
							}}
							aria-label="Toggle multi metric comparison"
						/>
						<Label
							htmlFor="hero-multi-toggle"
							className="cursor-pointer text-muted-foreground text-xs md:text-sm"
						>
							Multi
						</Label>
					</div>
				</div>

				<div className="flex flex-wrap gap-1.5 md:gap-2">
					{(["win_rate", "ban_rate", "pick_rate"] as Metric[]).map((m) => {
						const isSelected = selectedMetrics.includes(m);
						// In single mode there’s no “disabled” state—click always switches.
						// In multi mode, allow up to 2 selections.
						const atCapacity = multi && !isSelected && selectedMetrics.length >= 2;

						return (
							<button
								key={m}
								onClick={() => toggleMetric(m)}
								className={[
									"rounded-lg md:rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border transition-all",
									isSelected
										? "border-primary/40 shadow-sm"
										: "bg-card hover:bg-accent border-border/60",
									atCapacity && "opacity-40 cursor-not-allowed",
								].join(" ")}
								disabled={atCapacity}
								style={
									isSelected
										? {
												backgroundColor: `color-mix(in srgb, ${CHART_CONFIG[m].colorVar} 15%, transparent)`,
												borderColor: CHART_CONFIG[m].colorVar,
											}
										: {}
								}
							>
								{multi && isSelected && <span className="mr-1">✓</span>}
								{CHART_CONFIG[m].label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Chart */}
			<div className="h-[240px] md:h-[320px] w-full">
				<ResponsiveContainer>
					<AreaChart data={points} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
						<defs>
							<linearGradient id={leftGradId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={leftColorVar} stopOpacity={0.38} />
								<stop offset="95%" stopColor={leftColorVar} stopOpacity={0.06} />
							</linearGradient>
							<linearGradient id={rightGradId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={rightColorVar} stopOpacity={0.3} />
								<stop offset="95%" stopColor={rightColorVar} stopOpacity={0.05} />
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

						{/* Left Y-axis */}
						<YAxis
							yAxisId="left"
							domain={leftDomain}
							tickFormatter={(v) => pct(v, v < 0.1 ? 3 : 2)}
							tickLine={false}
							axisLine={false}
							width={48}
							tick={{ fontSize: 11 }}
						/>

						{/* Right Y-axis (only in multi with 2 metrics) */}
						{isDualAxis && (
							<YAxis
								yAxisId="right"
								orientation="right"
								domain={rightDomain}
								tickFormatter={(v) => pct(v, v < 0.1 ? 3 : 2)}
								tickLine={false}
								axisLine={false}
								width={48}
								tick={{ fontSize: 11 }}
							/>
						)}

						{/* mean reference lines */}
						<ReferenceLine
							yAxisId="left"
							y={leftStats.mean}
							stroke={leftColorVar}
							strokeDasharray="4 4"
							opacity={0.25}
						/>
						{isDualAxis && (
							<ReferenceLine
								yAxisId="right"
								y={rightStats.mean}
								stroke={rightColorVar}
								strokeDasharray="4 4"
								opacity={0.25}
							/>
						)}

						<Tooltip
							wrapperStyle={{ outline: "none" }}
							content={({ active, payload, label }) => {
								if (!active || !payload?.length) return null;

								return (
									<div className="rounded-lg md:rounded-xl border border-border/60 bg-popover p-2 md:p-3 shadow-lg">
										<div className="mb-1 text-[10px] md:text-xs text-muted-foreground">
											{formatXAxisDate(label)}
										</div>
										{payload.map((entry, idx) => {
											const metric = entry.dataKey as Metric;
											const val = entry.value as number;
											return (
												<div key={idx} className="flex items-baseline gap-1.5 md:gap-2 mb-0.5">
													<div
														className="h-2 w-2 rounded-full"
														style={{ background: entry.color }}
													/>
													<span className="text-xs md:text-sm">{CHART_CONFIG[metric].label}:</span>
													<span className="text-sm md:text-base font-semibold">
														{pct(val, val < 0.1 ? 3 : 2)}
													</span>
												</div>
											);
										})}
									</div>
								);
							}}
						/>

						{/* Left metric area */}
						<Area
							yAxisId="left"
							type="monotone"
							dataKey={leftMetric}
							stroke={leftColorVar}
							fill={`url(#${leftGradId})`}
							strokeWidth={2}
							dot={false}
							activeDot={{ r: 3 }}
						/>

						{/* Right metric area (only in multi with 2 metrics) */}
						{isDualAxis && rightMetric && (
							<Area
								yAxisId="right"
								type="monotone"
								dataKey={rightMetric}
								stroke={rightColorVar}
								fill={`url(#${rightGradId})`}
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 3 }}
							/>
						)}
					</AreaChart>
				</ResponsiveContainer>
			</div>

			{/* Tiny legend with current range context */}
			<div className="mt-2 md:mt-3 flex flex-wrap items-center gap-3 md:gap-4 text-[10px] md:text-xs text-muted-foreground">
				<div className="flex items-center gap-1.5">
					<div
						className="inline-block h-1.5 md:h-2 w-1.5 md:w-2 rounded-full"
						style={{ background: leftColorVar }}
					/>
					<span>
						{CHART_CONFIG[leftMetric].label}: <strong>{pct(leftDomain[0])}</strong> –{" "}
						<strong>{pct(leftDomain[1])}</strong>
					</span>
				</div>
				{isDualAxis && rightMetric && (
					<div className="flex items-center gap-1.5">
						<div
							className="inline-block h-1.5 md:h-2 w-1.5 md:w-2 rounded-full"
							style={{ background: rightColorVar }}
						/>
						<span>
							{CHART_CONFIG[rightMetric].label}: <strong>{pct(rightDomain[0])}</strong> –{" "}
							<strong>{pct(rightDomain[1])}</strong>
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
