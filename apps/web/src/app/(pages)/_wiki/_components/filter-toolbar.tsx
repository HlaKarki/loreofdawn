"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchIcon, FilterIcon, XIcon } from "lucide-react";
import { tidyLabel } from "@/lib/utils";
import Fuse from "fuse.js";
import type { ConsolidatedHeroOptional } from "@repo/database";

export type FilterState = {
	search: string;
	roles: string[];
	discoveryStatus: "all" | "discovered" | "undiscovered";
	sortBy: "alphabetical" | "role" | "discovery";
};

type FilterToolbarProps = {
	heroes: ConsolidatedHeroOptional[];
	filters: FilterState;
	onFilterChange: (filters: FilterState) => void;
	isDiscovered: (urlName: string) => boolean;
};

const ROLES = ["mage", "fighter", "assassin", "marksman", "tank"];

export function FilterToolbar({
	heroes,
	filters,
	onFilterChange,
	isDiscovered,
}: FilterToolbarProps) {
	const [rolePopoverOpen, setRolePopoverOpen] = useState(false);

	// Fuzzy search
	const fuse = useMemo(() => {
		return new Fuse(heroes, {
			keys: ["name", "url_name"],
			threshold: 0.3,
			distance: 100,
			minMatchCharLength: 1,
		});
	}, [heroes]);

	const handleSearchChange = (value: string) => {
		onFilterChange({ ...filters, search: value });
	};

	const handleRoleToggle = (role: string) => {
		const newRoles = filters.roles.includes(role)
			? filters.roles.filter((r) => r !== role)
			: [...filters.roles, role];

		onFilterChange({ ...filters, roles: newRoles });
	};

	const handleDiscoveryStatusChange = (value: FilterState["discoveryStatus"]) => {
		onFilterChange({ ...filters, discoveryStatus: value });
	};

	const handleSortChange = (value: FilterState["sortBy"]) => {
		onFilterChange({ ...filters, sortBy: value });
	};

	const clearFilters = () => {
		onFilterChange({
			search: "",
			roles: [],
			discoveryStatus: "all",
			sortBy: "alphabetical",
		});
	};

	const hasActiveFilters =
		filters.search || filters.roles.length > 0 || filters.discoveryStatus !== "all";

	return (
		<div className="sticky top-0 z-10 mb-6 rounded-lg border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex flex-col gap-4">
				{/* Search Input */}
				<div className="relative flex-1">
					<SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search heroes..."
						value={filters.search}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Filters Row */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Role Filter */}
					<Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="h-9">
								<FilterIcon className="mr-2 h-4 w-4" />
								Roles
								{filters.roles.length > 0 && (
									<Badge variant="secondary" className="ml-2">
										{filters.roles.length}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-56">
							<div className="space-y-3">
								<h4 className="text-sm font-semibold">Filter by Role</h4>
								{ROLES.map((role) => (
									<div key={role} className="flex items-center space-x-2">
										<Checkbox
											id={role}
											checked={filters.roles.includes(role)}
											onCheckedChange={() => handleRoleToggle(role)}
										/>
										<label
											htmlFor={role}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{tidyLabel(role)}
										</label>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>

					{/* Discovery Status Filter */}
					<Select value={filters.discoveryStatus} onValueChange={handleDiscoveryStatusChange}>
						<SelectTrigger className="h-9 w-[160px]">
							<SelectValue placeholder="Discovery status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Heroes</SelectItem>
							<SelectItem value="discovered">Discovered Only</SelectItem>
							<SelectItem value="undiscovered">Undiscovered Only</SelectItem>
						</SelectContent>
					</Select>

					{/* Sort */}
					<Select value={filters.sortBy} onValueChange={handleSortChange}>
						<SelectTrigger className="h-9 w-[160px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="alphabetical">Alphabetical</SelectItem>
							<SelectItem value="role">By Role</SelectItem>
							<SelectItem value="discovery">Discovery Order</SelectItem>
						</SelectContent>
					</Select>

					{/* Clear Filters */}
					{hasActiveFilters && (
						<Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
							<XIcon className="mr-2 h-4 w-4" />
							Clear
						</Button>
					)}
				</div>

				{/* Active Filters Display */}
				{filters.roles.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{filters.roles.map((role) => (
							<Badge key={role} variant="secondary" className="gap-1">
								{tidyLabel(role)}
								<button
									onClick={() => handleRoleToggle(role)}
									className="ml-1 rounded-full hover:bg-muted-foreground/20"
								>
									<XIcon className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
