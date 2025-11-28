"use client";

import { useState } from "react";
import {
	type ColumnDef,
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
import { Search, Settings2 } from "lucide-react";
import { cn, tidyLabel } from "@/lib/utils";

interface DataTableProps {
	columns: ColumnDef<ConsolidatedHeroOptional>[];
	data: ConsolidatedHeroOptional[];
}

export function DataTable({ columns, data }: DataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "meta.ban_rate",
			desc: true,
		},
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		// Hide difficulty by default
		difficulty: false,
	});

	const table = useReactTable({
		data,
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
				pageSize: 20,
			},
		},
	});

	// Extract unique roles and lanes for filters
	const roles = Array.from(new Set(data.map((h) => h.profile.roles[0]?.title).filter(Boolean)));
	const lanes = Array.from(new Set(data.map((h) => h.profile.lanes[0]?.title).filter(Boolean)));

	return (
		<div className="space-y-4">
			{/* Filters and Column Visibility */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
				<div className="flex flex-wrap gap-2">
					{/* Role Filter */}
					<Select
						onValueChange={(value) => {
							if (value === "all") {
								table.getColumn("role")?.setFilterValue(undefined);
							} else {
								table.getColumn("role")?.setFilterValue([value]);
							}
						}}
					>
						<SelectTrigger className="w-[140px]">
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
						onValueChange={(value) => {
							if (value === "all") {
								table.getColumn("lane")?.setFilterValue(undefined);
							} else {
								table.getColumn("lane")?.setFilterValue([value]);
							}
						}}
					>
						<SelectTrigger className="w-[140px]">
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

					{/* Column Visibility Toggle */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="h-10">
								<Settings2 className="h-4 w-4 sm:mr-2" />
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
				</div>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-lg border bg-card shadow-sm">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-transparent">
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className={cn(
												"bg-muted/50 font-semibold whitespace-nowrap",
												"px-2 py-2 sm:px-3",
											)}
											style={{
												...(header.column.columnDef.size && {
													width: `${header.getSize()}px`,
													minWidth: `${header.getSize()}px`,
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
								table.getRowModel().rows.map((row, index) => (
									<TableRow key={row.id} className={cn("transition-colors", "hover:bg-muted/30")}>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="px-2 py-1 sm:px-3"
												style={{
													...(cell.column.columnDef.size && {
														width: `${cell.column.getSize()}px`,
														minWidth: `${cell.column.getSize()}px`,
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
				<div className="text-sm text-muted-foreground">
					Showing{" "}
					<span className="font-medium text-foreground">
						{table.getFilteredRowModel().rows.length}
					</span>{" "}
					of <span className="font-medium text-foreground">{data.length}</span> heroes
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
