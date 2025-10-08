"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

const shimmerTransition = {
	duration: 1.6,
	repeat: Infinity,
	ease: "easeInOut",
} as const;

const shimmerKeyframes = { opacity: [0.45, 1, 0.45] };

function Placeholder({ className }: { className?: string }) {
	return (
		<motion.div
			className={`rounded-md bg-muted ${className ?? ""}`}
			animate={shimmerKeyframes}
			transition={shimmerTransition}
		/>
	);
}

function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={`rounded-xl border bg-card px-5 py-6 sm:px-6 sm:py-7 ${className ?? ""}`}>
			{children}
		</div>
	);
}

export default function Loading() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
			<SectionCard className="px-5 py-6 sm:px-6 sm:py-8">
				<div className="flex flex-col gap-6 md:flex-row md:items-center">
					<Placeholder className="h-28 w-28 rounded-xl border border-border bg-muted/60 sm:h-36 sm:w-36" />
					<div className="flex-1 space-y-5">
						<div className="space-y-3">
							<Placeholder className="h-9 w-48 rounded-lg sm:w-64" />
							<Placeholder className="h-4 w-64 rounded-lg sm:w-80" />
						</div>
						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="space-y-2 rounded-lg border bg-muted/20 px-3 py-4 text-muted-foreground sm:px-4"
								>
									<Placeholder className="h-3 w-16" />
									<Placeholder className="h-6 w-20 rounded-md" />
								</div>
							))}
						</div>
					</div>
				</div>
			</SectionCard>

			<div className="mt-8 space-y-6">
				<SectionCard>
					<Placeholder className="h-6 w-28 rounded-md" />
					<div className="mt-4 space-y-3">
						{Array.from({ length: 4 }).map((_, index) => (
							<Placeholder key={index} className="h-4 w-full" />
						))}
					</div>
				</SectionCard>

				<SectionCard>
					<div className="flex items-center justify-between gap-4">
						<Placeholder className="h-6 w-32 rounded-md" />
						<Placeholder className="h-4 w-24 rounded-md" />
					</div>
					<div className="mt-4 space-y-4">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="flex items-start gap-3">
								<Placeholder className="h-12 w-12 rounded-lg border border-border bg-muted/50 sm:h-14 sm:w-14" />
								<div className="flex-1 space-y-2">
									<Placeholder className="h-5 w-40 rounded-md" />
									<Placeholder className="h-4 w-full" />
									<div className="flex gap-3">
										<Placeholder className="h-3 w-16" />
										<Placeholder className="h-3 w-20" />
									</div>
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<div className="grid gap-6 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, column) => (
						<SectionCard key={column}>
							<Placeholder className="h-5 w-40 rounded-md" />
							<Placeholder className="mt-2 h-4 w-28 rounded-md" />
							<div className="mt-4 grid grid-cols-5 gap-2">
								{Array.from({ length: 5 }).map((_, hero) => (
									<Placeholder key={hero} className="aspect-square w-full rounded-lg" />
								))}
							</div>
						</SectionCard>
					))}
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<SectionCard key={index}>
							<div className="flex items-center justify-between gap-4">
								<Placeholder className="h-5 w-44 rounded-md" />
								<Placeholder className="h-4 w-16 rounded-md" />
							</div>
							<div className="mt-4 space-y-3">
								{Array.from({ length: 4 }).map((_, row) => (
									<div
										key={row}
										className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-3 sm:px-4"
									>
										<Placeholder className="h-12 w-12 rounded-md sm:h-12 sm:w-12" />
										<div className="flex-1 space-y-2">
											<Placeholder className="h-4 w-32 rounded-md" />
											<div className="flex gap-3">
												<Placeholder className="h-3 w-14" />
												<Placeholder className="h-3 w-16" />
											</div>
										</div>
										<Placeholder className="h-4 w-12 rounded-md" />
									</div>
								))}
							</div>
						</SectionCard>
					))}
				</div>
			</div>
		</div>
	);
}
