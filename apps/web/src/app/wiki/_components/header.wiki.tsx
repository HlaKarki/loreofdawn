import { makeUrl } from "@/lib/utils.api";
import type { HeroAssets } from "@repo/database";
import Image from "next/image";
import { NuqsLink } from "./NuqsLink";
import { tidyLabel } from "@/lib/utils";

export const HeaderWiki = async ({ hero_name }: { hero_name: string }) => {
	const response = await fetch(makeUrl(`/v1/heroes/assets/${hero_name}`));

	if (!response.ok) {
		return (
			<header id="intro" className="mb-12">
				<h1 className="text-4xl font-bold capitalize tracking-tight md:text-5xl">
					{tidyLabel(hero_name)}
				</h1>
			</header>
		);
	}

	const data = (await response.json()) as { images: HeroAssets };
	const backgroundImage = data?.images?.painting;
	const displayImage = data?.images?.head_big;

	if (!displayImage || !backgroundImage) {
		return (
			<header id="intro" className="mb-12">
				<h1 className="text-4xl font-bold capitalize tracking-tight md:text-5xl">
					{tidyLabel(hero_name)}
				</h1>
			</header>
		);
	}

	return (
		<header
			id="intro"
			className="relative mb-8 overflow-hidden rounded-xl border border-border/60 sm:mb-12 sm:rounded-2xl"
			aria-labelledby="hero-heading"
		>
			{/* Background layer */}
			<div className="absolute inset-0">
				<Image
					src={backgroundImage}
					alt=""
					fill
					priority
					sizes="100vw"
					className="absolute inset-0 object-cover object-top opacity-20 sm:opacity-30"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background" />
			</div>

			{/* Content */}
			<div className="relative">
				<div className="relative flex flex-col gap-4 p-4 sm:grid sm:grid-cols-[auto,1fr] sm:gap-6 sm:p-6 md:gap-8 md:p-8">
					{/* Hero portrait - smaller on mobile */}
					<div className="relative mx-auto aspect-square w-32 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-primary/10 to-transparent sm:mx-0 sm:w-40 md:w-48">
						<Image
							src={displayImage}
							alt={`${tidyLabel(hero_name)} portrait`}
							fill
							priority
							sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
							className="absolute inset-0 object-cover"
						/>
					</div>

					{/* Hero info */}
					<div className="flex min-w-0 flex-col justify-end text-center sm:text-left">
						<h1
							id="hero-heading"
							className="text-balance text-2xl font-extrabold capitalize tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
						>
							{tidyLabel(hero_name)}
						</h1>

						{/* Meta information */}
						<div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:justify-start sm:text-sm">
							<span className="inline-flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-primary/70" aria-hidden="true" />
								<span>Official Art</span>
							</span>
						</div>

						{/* Quick actions */}
						<div className="mt-3 flex flex-wrap justify-center gap-2 sm:mt-4 sm:justify-start">
							<NuqsLink
								section="story"
								className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
							>
								Story
							</NuqsLink>
							<NuqsLink
								section="trivia"
								className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
							>
								Trivia
							</NuqsLink>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};
