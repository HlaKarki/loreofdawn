import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function TableSkeleton({ rows = 20, columns = 8 }: { rows?: number; columns?: number }) {
	return (
		<div className="space-y-4">
			{/* Filter Skeletons */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-10 w-full max-w-sm" />
				<div className="flex gap-2">
					<Skeleton className="h-10 w-[140px]" />
					<Skeleton className="h-10 w-[140px]" />
				</div>
			</div>

			{/* Table Skeleton */}
			<div className="overflow-hidden rounded-lg border bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							{Array.from({ length: columns }).map((_, i) => (
								<TableHead key={i} className="bg-muted/50 px-4 py-3">
									<Skeleton className="h-4 w-20" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rows }).map((_, rowIndex) => (
							<TableRow
								key={rowIndex}
								className={rowIndex % 2 === 0 ? "bg-transparent" : "bg-muted/5"}
							>
								{Array.from({ length: columns }).map((_, colIndex) => (
									<TableCell key={colIndex} className="px-4 py-3">
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Skeleton */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-4 w-48" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-20" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-9 w-20" />
				</div>
			</div>
		</div>
	);
}
