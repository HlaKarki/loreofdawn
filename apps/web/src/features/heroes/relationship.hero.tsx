import type { MlHeroProfile } from "@repo/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tidyLabel } from "@/lib/utils";
import { Img } from "@/components/img";
import { resolveImageSrc } from "@/lib/images";

export const HeroRelationship = ({ data }: { data: MlHeroProfile }) => {
	return (
		<div className="mb-6 grid gap-6 lg:grid-cols-3">
			{/* Strong Against */}
			{data.relation?.strong_against?.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Strong Against</CardTitle>
						<CardDescription>Heroes this hero counters</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{data.relation.strong_against.map((relation, idx) => (
							<div key={idx}>
								<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
								<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
									{relation.heroes.map((h) => (
										<div
											key={h.id}
											className="group relative aspect-square overflow-hidden rounded"
										>
											<Img
												src={resolveImageSrc(h.image)}
												alt={tidyLabel(h.name)}
												sizes={"256px"}
												className="absolute inset-0 h-full w-full object-cover"
											/>
											<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
												<span className="block break-words text-[11px] font-medium leading-snug text-white">
													{tidyLabel(h.name)}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Weak Against */}
			{data.relation?.weak_against?.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Weak Against</CardTitle>
						<CardDescription>Heroes that counter this hero</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{data.relation.weak_against.map((relation, idx) => (
							<div key={idx}>
								<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
								<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
									{relation.heroes.map((h) => (
										<div
											key={h.id}
											className="group relative aspect-square overflow-hidden rounded"
										>
											<Img
												src={resolveImageSrc(h.image)}
												alt={tidyLabel(h.name)}
												sizes={"256px"}
												className="absolute inset-0 h-full w-full object-cover"
											/>
											<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
												<span className="block break-words text-[11px] font-medium leading-snug text-white">
													{tidyLabel(h.name)}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Compatible With */}
			{data.relation?.compatible_with?.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Compatible With</CardTitle>
						<CardDescription>Heroes that synergize well</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{data.relation.compatible_with.map((relation, idx) => (
							<div key={idx}>
								<p className="mb-2 text-sm text-muted-foreground">{relation.description}</p>
								<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
									{relation.heroes.map((h) => (
										<div
											key={h.id}
											className="group relative aspect-square overflow-hidden rounded"
										>
											<Img
												src={resolveImageSrc(h.image)}
												alt={tidyLabel(h.name)}
												sizes={"256px"}
												className="absolute inset-0 h-full w-full object-cover"
											/>
											<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-6 opacity-0 transition group-hover:opacity-100">
												<span className="block break-words text-[11px] font-medium leading-snug text-white">
													{tidyLabel(h.name)}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
};
