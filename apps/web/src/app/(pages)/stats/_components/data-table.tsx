"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConsolidatedHeroOptional } from "@repo/database";
import { Search, Eye } from "lucide-react";
import { cn, tidyLabel } from "@/lib/utils";
import { RatesFilter, type RateFilter } from "./rates-filter";
import { DensityToggle, type TableDensity, getDensityConfig } from "./density-toggle";
import { ExportCsv } from "./export-csv";
import { FilterPresets, type FilterPreset } from "./filter-presets";
import { createColumns } from "./columns";

interface DataTableProps {
	data: ConsolidatedHeroOptional[];
	rank: string;
}

export function DataTable({ data, rank }: DataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "meta.ban_rate",
			desc: true,
		},
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [density, setDensity] = useState<TableDensity>("normal");
	const [rateFilters, setRateFilters] = useState<RateFilter[]>([]);
	const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
	const [selectedLane, setSelectedLane] = useState<string | undefined>(undefined);

	// Get density-based configuration
	const densityConfig = getDensityConfig(density);

	// Create columns based on density - MEMOIZED
	const columns = useMemo(() => createColumns(densityConfig), [densityConfig]);

	// Column visibility based on density
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		// Hide difficulty by default (except in comfortable mode)
		difficulty: density === "comfortable",
	});

	// Update column visibility when density changes
	useEffect(() => {
		if (density === "comfortable") {
			// Show all columns in comfortable mode
			setColumnVisibility({});
		} else {
			// Hide difficulty in compact/normal modes
			setColumnVisibility({ difficulty: false });
		}
	}, [density]);

	// Apply rate filters to data - MEMOIZED to prevent infinite loops
	const filteredData = useMemo(() => {
		// If no rate filters, return original data
		if (rateFilters.length === 0) return data;

		// Filter data based on rate filters
		return data.filter((hero) => {
			// Check all active filters - hero must pass all of them
			return rateFilters.every((filter) => {
				const value = hero.meta[filter.type];

				// Check min condition
				if (filter.min !== undefined && value < filter.min) {
					return false;
				}

				// Check max condition
				if (filter.max !== undefined && value > filter.max) {
					return false;
				}

				return true;
			});
		});
	}, [data, rateFilters]);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			globalFilter,
			columnVisibility,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	// Extract unique roles and lanes for filters - MEMOIZED
	const roles = useMemo(
		() => Array.from(new Set(data.map((h) => h.profile.roles[0]?.title).filter(Boolean))),
		[data],
	);
	const lanes = useMemo(
		() => Array.from(new Set(data.map((h) => h.profile.lanes[0]?.title).filter(Boolean))),
		[data],
	);

	// Handle loading a preset - AFTER table is created
	const handleLoadPreset = useCallback(
		(preset: FilterPreset) => {
			// Apply role filter
			if (preset.filters.role) {
				setSelectedRole(preset.filters.role);
				table.getColumn("role")?.setFilterValue([preset.filters.role]);
			} else {
				setSelectedRole(undefined);
				table.getColumn("role")?.setFilterValue(undefined);
			}

			// Apply lane filter
			if (preset.filters.lane) {
				setSelectedLane(preset.filters.lane);
				table.getColumn("lane")?.setFilterValue([preset.filters.lane]);
			} else {
				setSelectedLane(undefined);
				table.getColumn("lane")?.setFilterValue(undefined);
			}

			// Apply rate filters
			setRateFilters(preset.filters.rateFilters);

			// Apply global filter (search)
			setGlobalFilter(preset.filters.globalFilter);
		},
		[table],
	);

	return (
		<div className="w-full max-w-full space-y-4 overflow-hidden">
			{/* Filters and Column Visibility */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				{/* Search */}
				<div className="relative w-full sm:max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search heroes..."
						value={globalFilter ?? ""}
						onChange={(event) => setGlobalFilter(event.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Filters and Column Visibility */}
				<div className="flex flex-wrap gap-2 items-center">
					{/* Role Filter */}
					<Select
						value={selectedRole || "all"}
						onValueChange={(value) => {
							if (value === "all") {
								setSelectedRole(undefined);
								table.getColumn("role")?.setFilterValue(undefined);
							} else {
								setSelectedRole(value);
								table.getColumn("role")?.setFilterValue([value]);
							}
						}}
					>
						<SelectTrigger className="w-[120px] sm:w-[140px]">
							<SelectValue placeholder="All Roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							{roles.map((role) => (
								<SelectItem key={role} value={role}>
									{tidyLabel(role)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Lane Filter */}
					<Select
						value={selectedLane || "all"}
						onValueChange={(value) => {
							if (value === "all") {
								setSelectedLane(undefined);
								table.getColumn("lane")?.setFilterValue(undefined);
							} else {
								setSelectedLane(value);
								table.getColumn("lane")?.setFilterValue([value]);
							}
						}}
					>
						<SelectTrigger className="w-[120px] sm:w-[140px]">
							<SelectValue placeholder="All Lanes" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Lanes</SelectItem>
							{lanes.map((lane) => (
								<SelectItem key={lane} value={lane}>
									{tidyLabel(lane)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Density Toggle */}
					<DensityToggle density={density} onDensityChange={setDensity} />

					{/* Export CSV - exports currently visible filtered data */}
					<ExportCsv
						data={table.getFilteredRowModel().rows.map((row) => row.original)}
						rank={rank}
					/>

					{/* Filter Presets */}
					<FilterPresets
						currentFilters={{
							role: selectedRole,
							lane: selectedLane,
							rateFilters,
							globalFilter,
						}}
						onLoadPreset={handleLoadPreset}
					/>

					{/* Column Visibility Toggle */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="h-10">
								<Eye className="h-4 w-4 sm:mr-2" />
								<span className="hidden sm:inline">Columns</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[180px]">
							<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuCheckboxItem
								className="font-medium text-primary"
								checked={table
									.getAllColumns()
									.filter((c) => c.getCanHide())
									.every((c) => c.getIsVisible())}
								onCheckedChange={() => {
									const allVisible = table
										.getAllColumns()
										.filter((c) => c.getCanHide())
										.every((c) => c.getIsVisible());
									table.getAllColumns().forEach((column) => {
										if (column.getCanHide()) {
											column.toggleVisibility(!allVisible);
										}
									});
								}}
							>
								Show All
							</DropdownMenuCheckboxItem>
							<DropdownMenuSeparator />
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										>
											{column.id.replace("meta.", "").replace("profile.", "")}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Rates Filter - moved to last position */}
					<RatesFilter
						onFilterChange={setRateFilters}
						onSortChange={(columnId) => {
							// Auto-sort by the filtered column in descending order
							setSorting([{ id: columnId, desc: true }]);
						}}
					/>
				</div>
			</div>

			{/* Table */}
			<div className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
				<div className="w-full overflow-x-auto overscroll-x-none">
					<Table className="table-fixed" style={{ width: "inherit" }}>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-transparent">
									{headerGroup.headers.map((header, headerIndex) => (
										<TableHead
											key={header.id}
											className={cn(
												"bg-muted font-semibold whitespace-nowrap",
												"h-fit p-0", // Remove padding from TableHead for full-height borders
												// Sticky first 2 columns - same bg but solid to hide content
												headerIndex === 0 && "sticky left-0 z-20",
												headerIndex === 1 && "sticky left-[39.5px] z-20",
											)}
											style={{
												...(header.column.columnDef.size && {
													// Desktop: enforce exact width
													width: `${header.getSize()}px`,
													// Mobile: only maxWidth, let it shrink
													maxWidth: `${header.getSize()}px`,
												}),
											}}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row, rowIndex) => (
									<TableRow
										key={row.id}
										className="bg-primary-foreground transition-colors hover:bg-muted/30"
									>
										{row.getVisibleCells().map((cell, cellIndex) => (
											<TableCell
												key={cell.id}
												className={cn(
													densityConfig.cell,
													"bg-inherit",
													// Sticky first 2 columns
													cellIndex === 0 && "sticky left-0 z-10",
													cellIndex === 1 && "sticky left-[40px] z-10",
												)}
												style={{
													...(cell.column.columnDef.size && {
														// Desktop: enforce exact width
														width: `${cell.column.getSize()}px`,
														// Mobile: only maxWidth, let it shrink
														maxWidth: `${cell.column.getSize()}px`,
													}),
												}}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-32 text-center">
										<div className="flex flex-col items-center gap-2 text-muted-foreground">
											<Search className="h-8 w-8 opacity-20" />
											<p className="text-sm">No heroes found</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Pagination */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					<div className="text-sm text-muted-foreground">
						{(() => {
							const { pageIndex, pageSize } = table.getState().pagination;
							const totalRows = table.getFilteredRowModel().rows.length;
							const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
							const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

							return (
								<>
									Showing{" "}
									<span className="font-medium text-foreground">
										{startRow}-{endRow}
									</span>{" "}
									of <span className="font-medium text-foreground">{totalRows}</span> heroes
								</>
							);
						})()}
					</div>
					{/* Page Size Selector */}
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Show</span>
						<Select
							value={String(table.getState().pagination.pageSize)}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="h-9 w-[70px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="10">10</SelectItem>
								<SelectItem value="25">25</SelectItem>
								<SelectItem value="50">50</SelectItem>
								<SelectItem value="100">100</SelectItem>
								<SelectItem value={String(data.length)}>All</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<div className="flex items-center gap-1 text-sm">
						<span className="text-muted-foreground">Page</span>
						<span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>
						<span className="text-muted-foreground">of</span>
						<span className="font-medium">{table.getPageCount()}</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
