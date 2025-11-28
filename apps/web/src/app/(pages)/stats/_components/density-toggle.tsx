"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";

export type TableDensity = "compact" | "normal" | "comfortable";

interface DensityToggleProps {
	density: TableDensity;
	onDensityChange: (density: TableDensity) => void;
}

export function DensityToggle({ density, onDensityChange }: DensityToggleProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="h-10">
					<LayoutGrid className="h-4 w-4 sm:mr-2" />
					<span className="hidden sm:inline">Density</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[180px]">
				<DropdownMenuLabel>Table Density</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					value={density}
					onValueChange={onDensityChange as (value: string) => void}
				>
					<DropdownMenuRadioItem value="compact">
						<div className="flex flex-col">
							<span>Compact</span>
							<span className="text-xs text-muted-foreground">Less spacing</span>
						</div>
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="normal">
						<div className="flex flex-col">
							<span>Normal</span>
							<span className="text-xs text-muted-foreground">Default spacing</span>
						</div>
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="comfortable">
						<div className="flex flex-col">
							<span>Comfortable</span>
							<span className="text-xs text-muted-foreground">More spacing</span>
						</div>
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Helper to get density-based styling configuration
export function getDensityConfig(density: TableDensity) {
	switch (density) {
		case "compact":
			return {
				cell: "px-1 py-0.5 sm:px-2",
				header: "px-1 py-1 sm:px-2",
				showHeroImage: false,
				heroImageSize: 0, // no image
				fontSize: {
					header: "text-[10px] sm:text-xs",
					cellDefault: "text-[10px] sm:text-xs",
					cellEmphasis: "text-[10px] sm:text-xs font-semibold",
					cellMuted: "text-[10px] sm:text-xs text-muted-foreground",
					heroName: "text-[10px] sm:text-xs",
				},
				iconSize: "h-4 w-4", // smaller role/lane icons
			};
		case "comfortable":
			return {
				cell: "px-2 py-2 sm:px-4",
				header: "px-2 py-3 sm:px-4",
				showHeroImage: true,
				heroImageSize: 56, // larger image (14 * 4 = 56px)
				fontSize: {
					header: "text-sm sm:text-base",
					cellDefault: "text-sm sm:text-base",
					cellEmphasis: "text-sm sm:text-base font-semibold",
					cellMuted: "text-sm sm:text-base text-muted-foreground",
					heroName: "text-sm sm:text-base",
				},
				iconSize: "h-7 w-7", // larger role/lane icons
			};
		default: // normal
			return {
				cell: "px-1 py-1 sm:px-3",
				header: "px-1 py-2 sm:px-3",
				showHeroImage: true,
				heroImageSize: 48, // default image (12 * 4 = 48px)
				fontSize: {
					header: "text-xs sm:text-sm",
					cellDefault: "text-xs sm:text-sm",
					cellEmphasis: "text-xs sm:text-sm font-semibold",
					cellMuted: "text-xs sm:text-sm text-muted-foreground",
					heroName: "text-xs sm:text-sm",
				},
				iconSize: "h-6 w-6", // normal role/lane icons
			};
	}
}
