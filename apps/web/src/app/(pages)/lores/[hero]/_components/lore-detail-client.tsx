"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { WikiTableData } from "@repo/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
			{/* Back Button */}
			<div className="mb-6">
				<Link href="/lores">
					<Button variant="ghost" size="sm">
						<ArrowLeftIcon className="mr-2 h-4 w-4" />
						Back
					</Button>
				</Link>
			</div>

			{/* Hero Header */}
			<div className="mb-8 space-y-4">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							{tidyLabel(wiki.hero)}
						</h1>
						{metadata.teaser && (
							<p className="max-w-3xl text-lg text-muted-foreground">{metadata.teaser}</p>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary" className="text-xs">
							{tidyLabel(metadata.storyType)}
						</Badge>
						{metadata.storyArc && (
							<Badge variant="outline" className="text-xs">
								{tidyLabel(metadata.storyArc)}
							</Badge>
						)}
					</div>
				</div>

				{/* Hook Quote */}
				{metadata.hook && (
					<blockquote className="border-l-4 border-amber-500 bg-amber-500/5 p-4 text-base italic">
						{metadata.hook}
					</blockquote>
				)}

				{/* Metadata Tags */}
				<div className="space-y-3">
					{metadata.moods && metadata.moods.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<HeartIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Moods:</span>
							{metadata.moods.map((mood) => (
								<Badge key={mood} variant="secondary" className="bg-amber-500/15 text-amber-800">
									{tidyLabel(mood)}
								</Badge>
							))}
						</div>
					)}

					{metadata.themes && metadata.themes.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<BookOpenIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Themes:</span>
							{metadata.themes.map((theme) => (
								<Badge key={theme} variant="outline">
									{tidyLabel(theme)}
								</Badge>
							))}
						</div>
					)}

					{metadata.relationships?.faction && (
						<div className="flex flex-wrap items-center gap-2">
							<UsersIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Faction:</span>
							<Badge variant="secondary">{metadata.relationships.faction}</Badge>
							{metadata.relationships.factionRole && (
								<span className="text-sm text-muted-foreground">
									({metadata.relationships.factionRole})
								</span>
							)}
						</div>
					)}

					{metadata.locations && metadata.locations.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<MapPinIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Locations:</span>
							{metadata.locations.slice(0, 5).map((location) => (
								<Badge key={location} variant="outline" className="text-xs">
									{location}
								</Badge>
							))}
						</div>
					)}
				</div>

				{/* Stats */}
				<div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
					<span className="flex items-center gap-1">
						<ClockIcon className="h-4 w-4" />
						{metadata.readingTimeMinutes} min read
					</span>
					{metadata.hasChapters && (
						<span className="flex items-center gap-1">
							<BookMarkedIcon className="h-4 w-4" />
							{metadata.chapterCount} chapters
						</span>
					)}
					<span className="flex items-center gap-1">
						<UsersIcon className="h-4 w-4" />
						{metadata.connectionsCount} connections
					</span>
				</div>
			</div>

			<div className="my-6 h-px bg-border" />

			{/* Profile Section */}
			{sections.profile?.markdown && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UsersIcon className="h-5 w-5 text-amber-600" />
							Profile
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="prose prose-slate dark:prose-invert max-w-none">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{sections.profile.markdown}</ReactMarkdown>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Tabs Navigation */}
			<div className="mb-6 flex flex-wrap gap-2">
				<Button
					variant={activeTab === "story" ? "default" : "outline"}
					size="sm"
					onClick={() => setActiveTab("story")}
					className={cn(activeTab === "story" && "bg-amber-600 text-white hover:bg-amber-600/90")}
				>
					<BookOpenIcon className="mr-2 h-4 w-4" />
					Main Story
				</Button>
				{metadata.hasChapters && (
					<Button
						variant={activeTab === "chapters" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveTab("chapters")}
						className={cn(
							activeTab === "chapters" && "bg-amber-600 text-white hover:bg-amber-600/90",
						)}
					>
						<BookMarkedIcon className="mr-2 h-4 w-4" />
						Chapters ({metadata.chapterCount})
					</Button>
				)}
				{metadata.hasAbilityLore && (
					<Button
						variant={activeTab === "abilities" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveTab("abilities")}
						className={cn(
							activeTab === "abilities" && "bg-amber-600 text-white hover:bg-amber-600/90",
						)}
					>
						<ZapIcon className="mr-2 h-4 w-4" />
						Abilities
					</Button>
				)}
				{metadata.hasTrivia && (
					<Button
						variant={activeTab === "trivia" ? "default" : "outline"}
						size="sm"
						onClick={() => setActiveTab("trivia")}
						className={cn(
							activeTab === "trivia" && "bg-amber-600 text-white hover:bg-amber-600/90",
						)}
					>
						<LightbulbIcon className="mr-2 h-4 w-4" />
						Trivia
					</Button>
				)}
			</div>

			{/* Tab Content */}
			<div className="space-y-6">
				{/* Main Story */}
				{activeTab === "story" && sections.story?.markdown && (
					<Card>
						<CardHeader>
							<CardTitle>Backstory</CardTitle>
							{metadata.openingLine && (
								<p className="text-sm italic text-muted-foreground">
									&ldquo;{metadata.openingLine}&rdquo;
								</p>
							)}
						</CardHeader>
						<CardContent>
							<div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-amber-900 dark:prose-headings:text-amber-400">
								<ReactMarkdown remarkPlugins={[remarkGfm]}>{sections.story.markdown}</ReactMarkdown>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Side Story Chapters */}
				{activeTab === "chapters" && sections.side_story?.chapters && (
					<div className="space-y-4">
						{sections.side_story.chapters.map((chapter, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<BookMarkedIcon className="h-5 w-5 text-amber-600" />
										Chapter {index + 1}: {chapter.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-slate dark:prose-invert max-w-none">
										<ReactMarkdown remarkPlugins={[remarkGfm]}>
											{chapter.content.markdown}
										</ReactMarkdown>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Abilities */}
				{activeTab === "abilities" && sections.abilities && (
					<div className="space-y-4">
						{sections.abilities.map((ability, index) => (
							<Card key={index}>
								<CardHeader>
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1">
											<CardTitle className="flex items-center gap-2">
												<ZapIcon className="h-5 w-5 text-amber-600" />
												{ability.name}
											</CardTitle>
											<div className="flex flex-wrap gap-2">
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
										<div className="flex flex-wrap gap-2 text-sm">
											{ability.cooldown !== undefined && ability.cooldown > 0 && (
												<Badge variant="outline" className="text-xs">
													CD: {ability.cooldown}s
												</Badge>
											)}
											{ability.cost && (
												<Badge variant="outline" className="text-xs">
													Cost: {ability.cost}
												</Badge>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
										<ReactMarkdown remarkPlugins={[remarkGfm]}>
											{ability.details.markdown}
										</ReactMarkdown>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Trivia */}
				{activeTab === "trivia" && sections.trivia && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<LightbulbIcon className="h-5 w-5 text-amber-600" />
								Did You Know?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{sections.trivia.map((fact, index) => (
									<li key={index} className="flex gap-3">
										<span className="text-amber-600">•</span>
										<div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
											<ReactMarkdown remarkPlugins={[remarkGfm]}>{fact.markdown}</ReactMarkdown>
										</div>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Relationships Section */}
			{metadata.relationships && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UsersIcon className="h-5 w-5 text-amber-600" />
							Relationships &amp; Connections
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{metadata.relationships.allies && metadata.relationships.allies.length > 0 && (
							<div>
								<h4 className="mb-2 text-sm font-semibold">Allies</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.allies.map((ally) => (
										<Link key={ally} href={`/lores/${ally}`}>
											<Badge variant="secondary" className="cursor-pointer hover:bg-green-500/20">
												{tidyLabel(ally)}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.rivals && metadata.relationships.rivals.length > 0 && (
							<div>
								<h4 className="mb-2 text-sm font-semibold">Rivals &amp; Enemies</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.rivals.map((rival) => (
										<Link key={rival} href={`/lores/${rival}`}>
											<Badge variant="secondary" className="cursor-pointer hover:bg-red-500/20">
												{tidyLabel(rival)}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.family && metadata.relationships.family.length > 0 && (
							<div>
								<h4 className="mb-2 text-sm font-semibold">Family</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.family.map((member) => (
										<Link key={member} href={`/lores/${member}`}>
											<Badge variant="secondary" className="cursor-pointer hover:bg-blue-500/20">
												{tidyLabel(member)}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.mentors && metadata.relationships.mentors.length > 0 && (
							<div>
								<h4 className="mb-2 text-sm font-semibold">Mentors &amp; Students</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.relationships.mentors.map((mentor) => (
										<Link key={mentor} href={`/lores/${mentor}`}>
											<Badge variant="secondary" className="cursor-pointer hover:bg-purple-500/20">
												{tidyLabel(mentor)}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}

						{metadata.relationships.relatedHeroes &&
							metadata.relationships.relatedHeroes.length > 0 && (
								<div>
									<h4 className="mb-2 text-sm font-semibold">
										Related Heroes ({metadata.relationships.relatedHeroes.length})
									</h4>
									<div className="flex flex-wrap gap-2">
										{metadata.relationships.relatedHeroes.slice(0, 15).map((hero) => (
											<Link key={hero} href={`/lores/${hero}`}>
												<Badge
													variant="outline"
													className="cursor-pointer hover:bg-amber-500/20 text-xs"
												>
													{tidyLabel(hero)}
												</Badge>
											</Link>
										))}
										{metadata.relationships.relatedHeroes.length > 15 && (
											<Badge variant="outline" className="text-xs">
												+{metadata.relationships.relatedHeroes.length - 15} more
											</Badge>
										)}
									</div>
								</div>
							)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};
