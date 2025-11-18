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

interface Role {
	icon: string;
	title: string;
}

interface Images {
	head: string;
	head_big: string;
	painting: string;
	smallmap: string;
	squarehead: string;
	squarehead_big: string;
}

export interface QuadrantDataType {
	name: string;
	roles: Role[];
	images: Images;
	winRate: number;
	pickRate: number;
	banRate: number;
}

const getRoleOpacity = (role: string): number => {
	const opacityMap: Record<string, number> = {
		mage: 0.9,
		fighter: 0.75,
		assassin: 0.6,
		marksman: 0.45,
		tank: 0.3,
		support: 0.15,
	};
	return opacityMap[role] || 0.5;
};

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

	const role = payload.roles[0]?.title?.toLowerCase() || "mage";
	const opacity = getRoleOpacity(role);

	return (
		<circle
			cx={cx}
			cy={cy}
			r={radius}
			fill="currentColor"
			fillOpacity={opacity * 0.3}
			stroke="currentColor"
			strokeWidth={1.5}
			strokeOpacity={opacity * 0.5}
		/>
	);
};

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload || !payload.length) return null;

	const data = payload[0].payload;
	const role = data.roles[0]?.title?.toLowerCase() || "unknown";

	return (
		<Card className="border-border/50 bg-background/98 backdrop-blur-md shadow-2xl">
			<CardHeader className="p-4 pb-2">
				<div className="flex items-center gap-3">
					<div className="relative">
						<img
							src={data.images.squarehead || data.images.head}
							alt={data.name}
							className="h-12 w-12 rounded-lg border border-border object-cover"
						/>
					</div>
					<div>
						<CardTitle className="text-base font-bold">{data.name}</CardTitle>
						<CardDescription className="text-xs capitalize">{role}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-2 p-4 pt-2">
				<div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
					<span className="text-xs font-medium text-muted-foreground">Win Rate</span>
					<span className="text-sm font-bold">{(data.winRate * 100).toFixed(2)}%</span>
				</div>
				<div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
					<span className="text-xs font-medium text-muted-foreground">Pick Rate</span>
					<span className="text-sm font-bold">{(data.pickRate * 100).toFixed(2)}%</span>
				</div>
				<div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5">
					<span className="text-xs font-medium text-muted-foreground">Ban Rate</span>
					<span className="text-sm font-bold">{(data.banRate * 100).toFixed(2)}%</span>
				</div>
			</CardContent>
		</Card>
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
		<div className="space-y-6">
			<Card className="border-border/60 bg-gradient-to-br from-card via-card to-card/50">
				<CardHeader className="space-y-4 pb-4">
					<div className="space-y-3">
						<div className="flex items-start justify-between">
							<div className="space-y-1.5">
								<CardTitle className="text-3xl font-bold tracking-tight">
									Hero Performance Matrix
								</CardTitle>
								<CardDescription className="text-base leading-relaxed">
									Discover hidden gems and meta dominators. Bubble size represents ban pressure.
								</CardDescription>
							</div>
							<Badge
								variant="outline"
								className="gap-1.5 border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold capitalize"
							>
								Rank: {rank}
							</Badge>
						</div>
					</div>

					{/* Role Filter */}
					<div className="flex flex-wrap gap-2">
						<Badge
							variant={selectedRole === null ? "default" : "outline"}
							className="cursor-pointer px-3 py-1.5 text-xs transition-all hover:scale-105"
							onClick={() => setSelectedRole(null)}
						>
							All Roles
						</Badge>
						{roles.map((role) => (
							<Badge
								key={role}
								variant={selectedRole === role ? "default" : "outline"}
								className="cursor-pointer px-3 py-1.5 text-xs capitalize transition-all hover:scale-105"
								onClick={() => setSelectedRole(role)}
							>
								{role}
							</Badge>
						))}
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Chart */}
					<div className="rounded-xl border border-border/50 bg-background/50 p-2 sm:p-4">
						<ResponsiveContainer width="100%" height={600}>
							<ScatterChart
								margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
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
									className="stroke-muted-foreground"
									tick={{ fontSize: 12, fill: "currentColor" }}
									label={{
										value: "Pick Rate →",
										position: "insideBottom",
										offset: -15,
										fill: "currentColor",
										fontSize: 13,
										fontWeight: 600,
									}}
								/>
								<YAxis
									type="number"
									dataKey="winRate"
									name="Win Rate"
									domain={[0.42, 0.58]}
									tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
									className="stroke-muted-foreground"
									tick={{ fontSize: 12, fill: "currentColor" }}
									label={{
										value: "Win Rate →",
										angle: -90,
										position: "insideLeft",
										fill: "currentColor",
										fontSize: 13,
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
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
