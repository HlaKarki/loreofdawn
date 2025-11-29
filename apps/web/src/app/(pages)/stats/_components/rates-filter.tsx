"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sliders, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type RateFilterType = "win_rate" | "pick_rate" | "ban_rate";

export type RateOperator = "lte" | "gte"; // less than or equal, greater than or equal

export interface RateFilter {
	type: RateFilterType;
	label: string;
	min?: number;
	max?: number;
	sortBy?: boolean; // Indicates this filter should trigger sorting
}

interface RatesFilterProps {
	onFilterChange: (filters: RateFilter[]) => void;
	onSortChange?: (columnId: string) => void;
}

export function RatesFilter({ onFilterChange, onSortChange }: RatesFilterProps) {
	// Input values (what user is typing)
	const [inputValues, setInputValues] = useState<{
		win_rate: string;
		ban_rate: string;
		pick_rate: string;
	}>({
		win_rate: "",
		ban_rate: "",
		pick_rate: "",
	});

	// Active filter values (what's currently applied)
	const [activeValues, setActiveValues] = useState<{
		win_rate: string;
		ban_rate: string;
		pick_rate: string;
	}>({
		win_rate: "",
		ban_rate: "",
		pick_rate: "",
	});

	// Operator states (lte = ≤, gte = ≥)
	const [operators, setOperators] = useState<{
		win_rate: RateOperator;
		ban_rate: RateOperator;
		pick_rate: RateOperator;
	}>({
		win_rate: "lte",
		ban_rate: "lte",
		pick_rate: "lte",
	});

	// Active operators (what's currently applied)
	const [activeOperators, setActiveOperators] = useState<{
		win_rate: RateOperator;
		ban_rate: RateOperator;
		pick_rate: RateOperator;
	}>({
		win_rate: "lte",
		ban_rate: "lte",
		pick_rate: "lte",
	});

	const handleInputChange = (type: RateFilterType, value: string) => {
		// Only allow numbers and decimal point
		if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
			return;
		}

		// Update input value
		setInputValues({ ...inputValues, [type]: value });
	};

	const toggleOperator = (type: RateFilterType) => {
		setOperators({
			...operators,
			[type]: operators[type] === "lte" ? "gte" : "lte",
		});
	};

	const handleSetFilter = (type: RateFilterType) => {
		const value = inputValues[type];

		// Update active values and operators
		const newActiveValues = { ...activeValues, [type]: value };
		const newActiveOperators = { ...activeOperators, [type]: operators[type] };
		setActiveValues(newActiveValues);
		setActiveOperators(newActiveOperators);

		// Build filter array
		const filters: RateFilter[] = [];

		// Process each rate type
		Object.entries(newActiveValues).forEach(([rateType, val]) => {
			if (val !== "" && !isNaN(Number(val))) {
				const numValue = Number(val);
				// Convert percentage to decimal (e.g., 52 -> 0.52)
				const decimalValue = numValue > 1 ? numValue / 100 : numValue;
				const operator = newActiveOperators[rateType as RateFilterType];
				const operatorSymbol = operator === "lte" ? "≤" : "≥";

				filters.push({
					type: rateType as RateFilterType,
					label: `${operatorSymbol}${numValue}%`,
					// Use min for gte (>=), max for lte (<=)
					...(operator === "lte" ? { max: decimalValue } : { min: decimalValue }),
					sortBy: true, // Enable sorting for this column
				});
			}
		});

		// Trigger filter change
		onFilterChange(filters);

		// If there's an active filter, trigger sorting by that column
		if (filters.length > 0 && onSortChange) {
			// Sort by the first active filter
			const sortColumn = `meta.${filters[0].type}`;
			onSortChange(sortColumn);
		}
	};

	const handleClearFilter = (type: RateFilterType) => {
		setInputValues({ ...inputValues, [type]: "" });
		setActiveValues({ ...activeValues, [type]: "" });
		setOperators({ ...operators, [type]: "lte" }); // Reset to default
		setActiveOperators({ ...activeOperators, [type]: "lte" });

		// Rebuild filters without this type
		const newActiveValues = { ...activeValues, [type]: "" };
		const filters: RateFilter[] = [];

		Object.entries(newActiveValues).forEach(([rateType, val]) => {
			if (val !== "" && !isNaN(Number(val))) {
				const numValue = Number(val);
				const decimalValue = numValue > 1 ? numValue / 100 : numValue;
				const operator = activeOperators[rateType as RateFilterType];
				const operatorSymbol = operator === "lte" ? "≤" : "≥";

				filters.push({
					type: rateType as RateFilterType,
					label: `${operatorSymbol}${numValue}%`,
					...(operator === "lte" ? { max: decimalValue } : { min: decimalValue }),
					sortBy: true,
				});
			}
		});

		onFilterChange(filters);
	};

	const hasActiveFilters =
		activeValues.win_rate !== "" || activeValues.ban_rate !== "" || activeValues.pick_rate !== "";

	const activeFilterCount = Object.values(activeValues).filter((v) => v !== "").length;

	return (
		<div className="flex items-center gap-2 flex-wrap">
			{/* Dropdown to add filters */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className={cn("h-10", hasActiveFilters && "border-primary")}
					>
						<Sliders className="h-4 w-4 sm:mr-2" />
						<span className="hidden sm:inline">Rates</span>
						<span
							className={cn(
								"ml-1.5 flex h-4 w-4 items-center justify-center rounded-full",
								"bg-primary text-[10px] font-bold text-primary-foreground",
								activeFilterCount === 0 && "bg-transparent text-transparent",
							)}
						>
							{activeFilterCount}
						</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-[320px]">
					<DropdownMenuLabel className="text-sm">Filter by Rates</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<div className="p-4 space-y-4">
						{/* Win Rate Input */}
						<div className="space-y-2">
							<label htmlFor="win-rate-input" className="text-xs font-semibold text-foreground">
								Win Rate (%)
							</label>
							<div className="flex gap-2">
								<Input
									id="win-rate-input"
									type="number"
									inputMode="decimal"
									placeholder="e.g., 52 or 0.52"
									value={inputValues.win_rate}
									onChange={(e) => handleInputChange("win_rate", e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSetFilter("win_rate");
										}
									}}
									className="h-9 flex-1"
									step="0.01"
									min="0"
									max="100"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => toggleOperator("win_rate")}
									className="h-9 w-12 px-0 font-mono text-base"
									title={
										operators.win_rate === "lte" ? "Less than or equal" : "Greater than or equal"
									}
								>
									{operators.win_rate === "lte" ? "≤" : "≥"}
								</Button>
								<Button
									size="sm"
									onClick={() => handleSetFilter("win_rate")}
									disabled={
										inputValues.win_rate === "" ||
										(inputValues.win_rate === activeValues.win_rate &&
											operators.win_rate === activeOperators.win_rate)
									}
									className="h-9 px-3"
								>
									Set
								</Button>
								{activeValues.win_rate !== "" && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleClearFilter("win_rate")}
										className="h-9 px-3"
									>
										Clear
									</Button>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Show heroes with {operators.win_rate === "lte" ? "≤" : "≥"} this win rate
							</p>
						</div>

						<DropdownMenuSeparator />

						{/* Ban Rate Input */}
						<div className="space-y-2">
							<label htmlFor="ban-rate-input" className="text-xs font-semibold text-foreground">
								Ban Rate (%)
							</label>
							<div className="flex gap-2">
								<Input
									id="ban-rate-input"
									type="number"
									inputMode="decimal"
									placeholder="e.g., 10 or 0.10"
									value={inputValues.ban_rate}
									onChange={(e) => handleInputChange("ban_rate", e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSetFilter("ban_rate");
										}
									}}
									className="h-9 flex-1"
									step="0.01"
									min="0"
									max="100"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => toggleOperator("ban_rate")}
									className="h-9 w-12 px-0 font-mono text-base"
									title={
										operators.ban_rate === "lte" ? "Less than or equal" : "Greater than or equal"
									}
								>
									{operators.ban_rate === "lte" ? "≤" : "≥"}
								</Button>
								<Button
									size="sm"
									onClick={() => handleSetFilter("ban_rate")}
									disabled={
										inputValues.ban_rate === "" ||
										(inputValues.ban_rate === activeValues.ban_rate &&
											operators.ban_rate === activeOperators.ban_rate)
									}
									className="h-9 px-3"
								>
									Set
								</Button>
								{activeValues.ban_rate !== "" && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleClearFilter("ban_rate")}
										className="h-9 px-3"
									>
										Clear
									</Button>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Show heroes with {operators.ban_rate === "lte" ? "≤" : "≥"} this ban rate
							</p>
						</div>

						<DropdownMenuSeparator />

						{/* Pick Rate Input */}
						<div className="space-y-2">
							<label htmlFor="pick-rate-input" className="text-xs font-semibold text-foreground">
								Pick Rate (%)
							</label>
							<div className="flex gap-2">
								<Input
									id="pick-rate-input"
									type="number"
									inputMode="decimal"
									placeholder="e.g., 5 or 0.05"
									value={inputValues.pick_rate}
									onChange={(e) => handleInputChange("pick_rate", e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSetFilter("pick_rate");
										}
									}}
									className="h-9 flex-1"
									step="0.01"
									min="0"
									max="100"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => toggleOperator("pick_rate")}
									className="h-9 w-12 px-0 font-mono text-base"
									title={
										operators.pick_rate === "lte" ? "Less than or equal" : "Greater than or equal"
									}
								>
									{operators.pick_rate === "lte" ? "≤" : "≥"}
								</Button>
								<Button
									size="sm"
									onClick={() => handleSetFilter("pick_rate")}
									disabled={
										inputValues.pick_rate === "" ||
										(inputValues.pick_rate === activeValues.pick_rate &&
											operators.pick_rate === activeOperators.pick_rate)
									}
									className="h-9 px-3"
								>
									Set
								</Button>
								{activeValues.pick_rate !== "" && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleClearFilter("pick_rate")}
										className="h-9 px-3"
									>
										Clear
									</Button>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Show heroes with {operators.pick_rate === "lte" ? "≤" : "≥"} this pick rate
							</p>
						</div>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Active Filter Pills */}
			{activeValues.win_rate !== "" && (
				<div className="flex items-center gap-1 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary h-10">
					<span>
						Win Rate {activeOperators.win_rate === "lte" ? "≤" : "≥"} {activeValues.win_rate}%
					</span>
					<button
						onClick={() => handleClearFilter("win_rate")}
						className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			)}
			{activeValues.ban_rate !== "" && (
				<div className="flex items-center gap-1 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary h-10">
					<span>
						Ban Rate {activeOperators.ban_rate === "lte" ? "≤" : "≥"} {activeValues.ban_rate}%
					</span>
					<button
						onClick={() => handleClearFilter("ban_rate")}
						className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			)}
			{activeValues.pick_rate !== "" && (
				<div className="flex items-center gap-1 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary h-10">
					<span>
						Pick Rate {activeOperators.pick_rate === "lte" ? "≤" : "≥"} {activeValues.pick_rate}%
					</span>
					<button
						onClick={() => handleClearFilter("pick_rate")}
						className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			)}
		</div>
	);
}
