"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { WikiTableData } from "@repo/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ArrowLeftIcon,
	BookMarkedIcon,
	BookOpenIcon,
	ClockIcon,
	HeartIcon,
	LightbulbIcon,
	MapPinIcon,
	UsersIcon,
	ZapIcon,
	ChevronRightIcon,
} from "lucide-react";
import { cn, tidyLabel } from "@/lib/utils";

type LoreDetailClientProps = {
	wiki: WikiTableData;
};

export const LoreDetailClient = ({ wiki }: LoreDetailClientProps) => {
	const [activeTab, setActiveTab] = useState<"story" | "chapters" | "abilities" | "trivia">(
		"story",
	);
	const metadata = wiki.metadata;
	const sections = wiki.sections;

	return (
		<div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
			{/* Back Button */}
			<div className="py-6">
				<Link
					href="/lores"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeftIcon className="h-4 w-4" />
					All Lores
				</Link>
			</div>

			{/* Header */}
			<header className="mb-10">
				{/* Badges */}
				<div className="mb-4 flex flex-wrap items-center gap-2">
					<Badge variant="secondary">{tidyLabel(metadata.storyType)}</Badge>
					{metadata.storyArc && (
						<Badge variant="outline" className="text-xs">
							{tidyLabel(metadata.storyArc)}
						</Badge>
					)}
					{metadata.epicnessScore > 70 && (
						<Badge className="bg-amber-500 text-white">Epic Tale</Badge>
					)}
				</div>

				{/* Title */}
				<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
					{tidyLabel(wiki.hero)}
				</h1>

				{/* Teaser */}
				{metadata.teaser && <p className="mb-6 text-xl text-muted-foreground">{metadata.teaser}</p>}

				{/* Hook Quote */}
				{metadata.hook && (
					<blockquote className="mb-6 border-l-4 border-amber-500 pl-4 text-lg italic text-foreground/80">
						"{metadata.hook}"
					</blockquote>
				)}

				{/* Quick Stats */}
				<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<ClockIcon className="h-4 w-4" />
						{metadata.readingTimeMinutes} min read
					</span>
					{metadata.hasChapters && (
						<span className="flex items-center gap-1.5">
							<BookMarkedIcon className="h-4 w-4" />
							{metadata.chapterCount} chapters
						</span>
					)}
					<span className="flex items-center gap-1.5">
						<UsersIcon className="h-4 w-4" />
						{metadata.connectionsCount} connections
					</span>
					{metadata.wordCount > 0 && (
						<span className="flex items-center gap-1.5">
							<BookOpenIcon className="h-4 w-4" />
							{metadata.wordCount.toLocaleString()} words
						</span>
					)}
				</div>

				{/* Tags */}
				<div className="mt-6 flex flex-wrap gap-2">
					{metadata.moods?.slice(0, 4).map((mood) => (
						<Badge key={mood} variant="secondary" className="text-xs">
							{tidyLabel(mood)}
						</Badge>
					))}
					{metadata.themes?.slice(0, 4).map((theme) => (
						<Badge key={theme} variant="outline" className="text-xs">
							{tidyLabel(theme)}
						</Badge>
					))}
					{metadata.relationships?.faction && (
						<Badge variant="outline" className="text-xs">
							{metadata.relationships.faction}
						</Badge>
					)}
				</div>
			</header>

			<div className="mb-10 h-px bg-border" />

			{/* Profile Section */}
			{sections.profile?.markdown && (
				<section className="mb-10">
					<h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
						<UsersIcon className="h-5 w-5 text-amber-500" />
						Profile
					</h2>
					<div className="prose prose-slate dark:prose-invert max-w-none">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{sections.profile.markdown.replaceAll('"', "")}</ReactMarkdown>
					</div>
				</section>
			)}

			{/* Tabs */}
			<div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setActiveTab("story")}
					className={cn(
						"gap-2",
						activeTab === "story" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
					)}
				>
					<BookOpenIcon className="h-4 w-4" />
					Story
				</Button>
				{metadata.hasChapters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setActiveTab("chapters")}
						className={cn(
							"gap-2",
							activeTab === "chapters" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
						)}
					>
						<BookMarkedIcon className="h-4 w-4" />
						Chapters ({metadata.chapterCount})
					</Button>
				)}
				{metadata.hasAbilityLore && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setActiveTab("abilities")}
						className={cn(
							"gap-2",
							activeTab === "abilities" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
						)}
					>
						<ZapIcon className="h-4 w-4" />
						Abilities
					</Button>
				)}
				{metadata.hasTrivia && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setActiveTab("trivia")}
						className={cn(
							"gap-2",
							activeTab === "trivia" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
						)}
					>
						<LightbulbIcon className="h-4 w-4" />
						Trivia
					</Button>
				)}
			</div>

			{/* Tab Content */}
			<div className="mb-12">
				{/* Main Story */}
				{activeTab === "story" && sections.story?.markdown && (
					<section>
						<h2 className="mb-2 text-2xl font-semibold">Backstory</h2>
						{metadata.openingLine && (
							<p className="mb-6 text-sm italic text-muted-foreground">"{metadata.openingLine}"</p>
						)}
						<div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-amber-600 dark:prose-a:text-amber-400">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{sections.story.markdown.replaceAll('"', "")}</ReactMarkdown>
						</div>
					</section>
				)}

				{/* Chapters */}
				{activeTab === "chapters" && sections.side_story?.chapters && (
					<div className="space-y-10">
						{sections.side_story.chapters.map((chapter, index) => (
							<section key={index}>
								<div className="mb-4 flex items-center gap-3">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-600 dark:text-amber-400">
										{index + 1}
									</span>
									<h2 className="text-xl font-semibold">{chapter.title}</h2>
								</div>
								<div className="prose prose-slate dark:prose-invert max-w-none">
									<ReactMarkdown remarkPlugins={[remarkGfm]}>
										{chapter.content.markdown.replaceAll('"', "")}
									</ReactMarkdown>
								</div>
							</section>
						))}
					</div>
				)}

				{/* Abilities */}
				{activeTab === "abilities" && sections.abilities && (
					<div className="space-y-8">
						{sections.abilities.map((ability, index) => (
							<section key={index} className="rounded-xl border border-border/60 p-5">
								<div className="mb-4 flex items-start justify-between gap-4">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
											<ZapIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
										</div>
										<div>
											<h3 className="font-semibold">{ability.name}</h3>
											<div className="flex flex-wrap gap-2 mt-1">
												<Badge variant="secondary" className="text-xs">
													{ability.slot}
												</Badge>
												{ability.role && (
													<Badge variant="outline" className="text-xs">
														{ability.role}
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex flex-wrap gap-2 text-xs">
										{ability.cooldown !== undefined && ability.cooldown > 0 && (
											<Badge variant="outline">CD: {ability.cooldown}s</Badge>
										)}
										{ability.cost && <Badge variant="outline">Cost: {ability.cost}</Badge>}
									</div>
								</div>
								<div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
									<ReactMarkdown remarkPlugins={[remarkGfm]}>
										{ability.details.markdown.replaceAll('"', "")}
									</ReactMarkdown>
								</div>
							</section>
						))}
					</div>
				)}

				{/* Trivia */}
				{activeTab === "trivia" && sections.trivia && (
					<section>
						<h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
							<LightbulbIcon className="h-5 w-5 text-amber-500" />
							Did You Know?
						</h2>
						<ul className="space-y-4">
							{sections.trivia.map((fact, index) => (
								<li key={index} className="flex gap-3">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400">
										{index + 1}
									</span>
									<div className="prose prose-slate dark:prose-invert max-w-none prose-sm prose-p:m-0">
										<ReactMarkdown remarkPlugins={[remarkGfm]}>{fact.markdown.replaceAll('"', "")}</ReactMarkdown>
									</div>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>

			{/* Relationships */}
			{metadata.relationships && (
				<section className="mb-12">
					<h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
						<UsersIcon className="h-5 w-5 text-amber-500" />
						Relationships & Connections
					</h2>

					<div className="space-y-6">
						{metadata.relationships.allies && metadata.relationships.allies.length > 0 && (
							<div>
								<h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
									<span className="h-2 w-2 rounded-full bg-emerald-500" />
									Allies
								</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.allies.map((ally) => (
										<Link key={ally} href={`/lores/${ally}`}>
											<Badge
												variant="secondary"
												className="cursor-pointer transition-colors hover:bg-emerald-500/20"
											>
												{tidyLabel(ally)}
												<ChevronRightIcon className="ml-1 h-3 w-3" />
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.rivals && metadata.relationships.rivals.length > 0 && (
							<div>
								<h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
									<span className="h-2 w-2 rounded-full bg-red-500" />
									Rivals & Enemies
								</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.rivals.map((rival) => (
										<Link key={rival} href={`/lores/${rival}`}>
											<Badge
												variant="secondary"
												className="cursor-pointer transition-colors hover:bg-red-500/20"
											>
												{tidyLabel(rival)}
												<ChevronRightIcon className="ml-1 h-3 w-3" />
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.family && metadata.relationships.family.length > 0 && (
							<div>
								<h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
									<span className="h-2 w-2 rounded-full bg-blue-500" />
									Family
								</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.family.map((member) => (
										<Link key={member} href={`/lores/${member}`}>
											<Badge
												variant="secondary"
												className="cursor-pointer transition-colors hover:bg-blue-500/20"
											>
												{tidyLabel(member)}
												<ChevronRightIcon className="ml-1 h-3 w-3" />
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.mentors && metadata.relationships.mentors.length > 0 && (
							<div>
								<h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
									<span className="h-2 w-2 rounded-full bg-purple-500" />
									Mentors & Students
								</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.mentors.map((mentor) => (
										<Link key={mentor} href={`/lores/${mentor}`}>
											<Badge
												variant="secondary"
												className="cursor-pointer transition-colors hover:bg-purple-500/20"
											>
												{tidyLabel(mentor)}
												<ChevronRightIcon className="ml-1 h-3 w-3" />
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.relatedHeroes &&
							metadata.relationships.relatedHeroes.length > 0 && (
								<div>
									<h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
										<span className="h-2 w-2 rounded-full bg-amber-500" />
										Related Heroes ({metadata.relationships.relatedHeroes.length})
									</h4>
									<div className="flex flex-wrap gap-2">
										{metadata.relationships.relatedHeroes.slice(0, 12).map((hero) => (
											<Link key={hero} href={`/lores/${hero}`}>
												<Badge
													variant="outline"
													className="cursor-pointer text-xs transition-colors hover:bg-amber-500/10"
												>
													{tidyLabel(hero)}
													<ChevronRightIcon className="ml-1 h-3 w-3" />
												</Badge>
											</Link>
										))}
										{metadata.relationships.relatedHeroes.length > 12 && (
											<Badge variant="outline" className="text-xs">
												+{metadata.relationships.relatedHeroes.length - 12} more
											</Badge>
										)}
									</div>
								</div>
							)}

						{metadata.locations && metadata.locations.length > 0 && (
							<div>
								<h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
									<MapPinIcon className="h-4 w-4 text-muted-foreground" />
									Locations
								</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.locations.map((location) => (
										<Badge key={location} variant="outline" className="text-xs">
											{location}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>
				</section>
			)}

			{/* Back to all lores */}
			<div className="border-t border-border pt-8">
				<Link
					href="/lores"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeftIcon className="h-4 w-4" />
					Back to All Lores
				</Link>
			</div>
		</div>
	);
};
