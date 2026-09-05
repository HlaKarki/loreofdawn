"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { formatPercentage } from "../_config/table-styles";

interface ExportCsvProps {
	data: ConsolidatedHeroOptional[];
	rank: string;
}

export function ExportCsv({ data, rank }: ExportCsvProps) {
	const handleExport = () => {
		// Build CSV content
		const headers = ["Hero", "Role", "Lane", "Win Rate", "Pick Rate", "Ban Rate", "Difficulty"];

		const rows = data.map((hero) => [
			hero.profile.name,
			hero.profile.roles[0]?.title || "Unknown",
			hero.profile.lanes[0]?.title || "Unknown",
			formatPercentage(hero.meta?.win_rate ?? 0),
			formatPercentage(hero.meta?.pick_rate ?? 0),
			formatPercentage(hero.meta?.ban_rate ?? 0),
			hero.profile.difficulty ? `${hero.profile.difficulty}/100` : "N/A",
		]);

		// Combine headers and rows
		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		// Create blob and download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`mlbb-hero-stats-${rank}-${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Button variant="outline" size="sm" className="h-10" onClick={handleExport}>
			<Download className="h-4 w-4 sm:mr-2" />
			<span className="hidden sm:inline">Export CSV</span>
		</Button>
	);
}
