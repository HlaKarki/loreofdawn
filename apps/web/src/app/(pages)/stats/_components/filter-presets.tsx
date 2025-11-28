"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Star, Trash2 } from "lucide-react";
import type { RateFilter } from "./rates-filter";

export interface FilterPreset {
	id: string;
	name: string;
	filters: {
		role?: string;
		lane?: string;
		rateFilters: RateFilter[];
		globalFilter: string;
	};
	createdAt: string;
}

interface FilterPresetsProps {
	currentFilters: {
		role?: string;
		lane?: string;
		rateFilters: RateFilter[];
		globalFilter: string;
	};
	onLoadPreset: (preset: FilterPreset) => void;
}

const STORAGE_KEY = "stats-filter-presets";

export function FilterPresets({ currentFilters, onLoadPreset }: FilterPresetsProps) {
	const [presets, setPresets] = useState<FilterPreset[]>([]);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [presetName, setPresetName] = useState("");

	// Load presets from localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				try {
					setPresets(JSON.parse(saved));
				} catch (e) {
					console.error("Failed to parse saved presets:", e);
				}
			}
		}
	}, []);

	// Save presets to localStorage
	const saveToStorage = (newPresets: FilterPreset[]) => {
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
			setPresets(newPresets);
		}
	};

	const handleSavePreset = () => {
		if (!presetName.trim()) return;

		const newPreset: FilterPreset = {
			id: Date.now().toString(),
			name: presetName.trim(),
			filters: currentFilters,
			createdAt: new Date().toISOString(),
		};

		const newPresets = [...presets, newPreset];
		saveToStorage(newPresets);
		setPresetName("");
		setSaveDialogOpen(false);
	};

	const handleDeletePreset = (id: string) => {
		const newPresets = presets.filter((p) => p.id !== id);
		saveToStorage(newPresets);
	};

	const hasActiveFilters =
		currentFilters.role ||
		currentFilters.lane ||
		currentFilters.rateFilters.length > 0 ||
		currentFilters.globalFilter;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="h-10">
						<Star className="h-4 w-4 sm:mr-2" />
						<span className="hidden sm:inline">Presets</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-[280px]">
					<DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{presets.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No saved presets yet
						</div>
					) : (
						<DropdownMenuGroup>
							{presets.map((preset) => (
								<div
									key={preset.id}
									className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm"
								>
									<button
										onClick={() => onLoadPreset(preset)}
										className="flex-1 text-left text-sm"
									>
										<div className="font-medium">{preset.name}</div>
										<div className="text-xs text-muted-foreground">
											{new Date(preset.createdAt).toLocaleDateString()}
										</div>
									</button>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 w-7 p-0"
										onClick={(e) => {
											e.stopPropagation();
											handleDeletePreset(preset.id);
										}}
									>
										<Trash2 className="h-3.5 w-3.5 text-destructive" />
									</Button>
								</div>
							))}
						</DropdownMenuGroup>
					)}

					<DropdownMenuSeparator />
					<div className="p-2">
						<Button
							variant="default"
							size="sm"
							className="w-full text-xs"
							onClick={() => setSaveDialogOpen(true)}
							disabled={!hasActiveFilters}
						>
							Save Current Filters
						</Button>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Save Preset Dialog */}
			<Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Save Filter Preset</DialogTitle>
						<DialogDescription>
							Give your current filter configuration a name to save it for quick access
							later.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor="preset-name" className="text-sm font-medium">
								Preset Name
							</label>
							<Input
								id="preset-name"
								placeholder="e.g., High Win Rate Tanks"
								value={presetName}
								onChange={(e) => setPresetName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSavePreset();
									}
								}}
							/>
						</div>
						<div className="text-xs text-muted-foreground">
							<div className="font-medium mb-1">Current Filters:</div>
							<ul className="list-disc list-inside space-y-0.5">
								{currentFilters.role && <li>Role: {currentFilters.role}</li>}
								{currentFilters.lane && <li>Lane: {currentFilters.lane}</li>}
								{currentFilters.rateFilters.map((filter) => (
									<li key={`${filter.type}-${filter.label}`}>
										{filter.type.replace("_", " ")}: {filter.label}
									</li>
								))}
								{currentFilters.globalFilter && (
									<li>Search: "{currentFilters.globalFilter}"</li>
								)}
							</ul>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSavePreset} disabled={!presetName.trim()}>
							Save Preset
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
