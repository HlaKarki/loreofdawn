"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
	ZAxis,
} from "recharts";
import { useMemo, useState } from "react";
import type { QuadrantDataType } from "@repo/database";

const CustomDot = (props: any) => {
	const { cx, cy, payload } = props;
	const size = 10 + payload.banRate * 60;
	const radius = size / 2;

	// Show avatar for ban rate > 0.1 (10%)
	const showAvatar = payload.banRate > 0.1;

	if (showAvatar) {
		// Sanitize hero name for valid clipPath ID
		const clipId = `clip-${payload.name.replace(/[^a-zA-Z0-9]/g, "-")}`;

		return (
			<g>
				<defs>
					<clipPath id={clipId}>
						<circle cx={cx} cy={cy} r={radius} />
					</clipPath>
				</defs>
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="currentColor"
					fillOpacity={0.15}
					stroke="currentColor"
					strokeWidth={2}
					strokeOpacity={0.4}
				/>
				<image
					x={cx - radius}
					y={cy - radius}
					width={size}
					height={size}
					href={payload.images.head || payload.images.squarehead}
					clipPath={`url(#${clipId})`}
					opacity={0.9}
				/>
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeOpacity={0.6}
				/>
			</g>
		);
	}

	return (
		<circle
			cx={cx}
			cy={cy}
			r={radius}
			fill="currentColor"
			fillOpacity={0.3}
			stroke="currentColor"
			strokeWidth={1.5}
			strokeOpacity={0.0}
		/>
	);
};

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload || !payload.length) return null;

	const data = payload[0].payload;
	const role = data.roles[0]?.title?.toLowerCase() || "unknown";

	return (
		<div className="rounded-lg border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur-sm">
			<div className="mb-2 flex items-center gap-2">
				<img
					src={data.images.squarehead || data.images.head}
					alt={data.name}
					className="h-8 w-8 rounded border border-border/40 object-cover"
				/>
				<div>
					<p className="text-sm font-semibold leading-tight">{data.name}</p>
					<p className="text-xs capitalize text-muted-foreground">{role}</p>
				</div>
			</div>
			<div className="space-y-1 text-xs">
				<div className="flex items-center justify-between gap-4">
					<span className="text-muted-foreground">Win</span>
					<span className="font-mono font-semibold">{(data.winRate * 100).toFixed(1)}%</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-muted-foreground">Pick</span>
					<span className="font-mono font-semibold">{(data.pickRate * 100).toFixed(2)}%</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-muted-foreground">Ban</span>
					<span className="font-mono font-semibold">{(data.banRate * 100).toFixed(1)}%</span>
				</div>
			</div>
		</div>
	);
};

export const QuadrantChart = ({ data, rank }: { data: QuadrantDataType[]; rank: string }) => {
	const [selectedRole, setSelectedRole] = useState<string | null>(null);

	const { medianPickRate, chartData } = useMemo(() => {
		const validData = data.filter((d) => d.winRate != null && d.pickRate != null);

		const sortedByPickRate = [...validData].sort((a, b) => a.pickRate - b.pickRate);

		const medianPickRate =
			sortedByPickRate[Math.floor(sortedByPickRate.length / 2)]?.pickRate || 0.05;

		const filteredData = selectedRole
			? validData.filter((d) => d.roles[0]?.title?.toLowerCase() === selectedRole)
			: validData;

		return {
			medianPickRate,
			chartData: filteredData,
		};
	}, [data, selectedRole]);

	const roles = useMemo(() => {
		const roleSet = new Set<string>();
		data.forEach((d) => {
			const role = d.roles[0]?.title?.toLowerCase();
			if (role) roleSet.add(role);
		});
		return Array.from(roleSet);
	}, [data]);

	return (
		<div className="mb-12">
			<div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold">Performance Matrix</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Discover hidden gems and meta dominators. Bubble size represents ban pressure.
					</p>
				</div>
				<Badge
					variant="outline"
					className="w-fit gap-1.5 border-amber-500/30 bg-amber-500/5 px-2.5 py-1 text-xs font-semibold capitalize sm:px-3 sm:py-1.5"
				>
					Rank: {rank}
				</Badge>
			</div>

			<Card className="rounded-2xl border-border/60 bg-gradient-to-br from-card via-card to-card/50">
				<CardHeader className="space-y-3 pb-3 sm:space-y-4 sm:pb-4">

					<div className="flex flex-wrap gap-1.5 sm:gap-2">
						<Badge
							variant={selectedRole === null ? "default" : "outline"}
							className="cursor-pointer px-2.5 py-1 text-xs transition-all hover:scale-105 sm:px-3 sm:py-1.5"
							onClick={() => setSelectedRole(null)}
						>
							All Roles
						</Badge>
						{roles.map((role) => (
							<Badge
								key={role}
								variant={selectedRole === role ? "default" : "outline"}
								className="cursor-pointer px-2.5 py-1 text-xs capitalize transition-all hover:scale-105 sm:px-3 sm:py-1.5"
								onClick={() => setSelectedRole(role)}
							>
								{role}
							</Badge>
						))}
					</div>
				</CardHeader>

				<CardContent className="px-2 sm:px-6">
					<ResponsiveContainer width="100%" height={400} className="sm:h-[500px] md:h-[600px]">
						<ScatterChart
							margin={{ top: 20, right: 5, bottom: 50, left: 2 }}
							className="text-foreground"
						>
							<CartesianGrid
								strokeDasharray="3 3"
								className="stroke-border"
								opacity={0.2}
								strokeWidth={1}
							/>
							<XAxis
								type="number"
								dataKey="pickRate"
								name="Pick Rate"
								domain={[0, "auto"]}
								tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
								tick={{ fontSize: 12, fill: "currentColor" }}
								label={{
									value: "Pick Rate →",
									position: "insideBottom",
									offset: -15,
									fill: "currentColor",
									fontSize: 12,
									fontWeight: 600,
								}}
							/>
							<YAxis
								type="number"
								dataKey="winRate"
								name="Win Rate"
								domain={[0.42, 0.58]}
								tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
								tick={{ fontSize: 12, fill: "currentColor" }}
								label={{
									value: "Win Rate →",
									angle: -90,
									position: "insideLeft",
									fill: "currentColor",
									fontSize: 12,
									fontWeight: 600,
								}}
							/>
							<ZAxis type="number" dataKey="banRate" range={[50, 800]} />
							<Tooltip
								content={<CustomTooltip />}
								cursor={{ strokeDasharray: "3 3", stroke: "currentColor", strokeOpacity: 0.3 }}
							/>

							<ReferenceLine
								x={medianPickRate}
								stroke="currentColor"
								strokeDasharray="5 5"
								strokeWidth={1.5}
								strokeOpacity={0.5}
								label={{
									value: `${(medianPickRate * 100).toFixed(2)}%`,
									position: "top",
									fill: "currentColor",
									fontSize: 11,
								}}
							/>

							<Scatter name="Heroes" data={chartData} shape={<CustomDot />} />
						</ScatterChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
};
