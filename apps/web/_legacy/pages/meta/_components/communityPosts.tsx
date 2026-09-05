"use client";

import type { RedditPostType } from "@repo/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ArrowUpIcon,
	MessageSquareIcon,
	ExternalLinkIcon,
	ImageIcon,
	VideoIcon,
	LinkIcon,
	ImagesIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

function formatScore(score: number): string {
	if (score >= 1000) {
		return `${(score / 1000).toFixed(1)}k`;
	}
	return score.toString();
}

function formatTimeAgo(timestamp: number): string {
	return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
}

function getPostTypeIcon(postType: RedditPostType["postType"]) {
	const className = "w-4 h-4 text-muted-foreground";
	switch (postType) {
		case "image":
			return <ImageIcon className={className} />;
		case "video":
			return <VideoIcon className={className} />;
		case "gallery":
			return <ImagesIcon className={className} />;
		case "link":
			return <LinkIcon className={className} />;
		default:
			return null;
	}
}

export const CommunityPosts = ({ data }: { data: RedditPostType[] }) => {
	if (!data || data.length === 0) {
		return null;
	}

	return (
		<div className="mb-12">
			<div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-2xl font-bold">Latest from the Community</h2>
				<a
					href="https://www.reddit.com/r/MobileLegendsGame/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
				>
					View subreddit
					<ExternalLinkIcon className="w-3 h-3" />
				</a>
			</div>

			<div className="space-y-3">
				{data.map((post) => (
					<Card
						key={post.id}
						className="overflow-hidden rounded-2xl border-border/60 hover:shadow-md transition-shadow cursor-pointer group"
					>
						<a href={post.permalink} target="_blank" rel="noopener noreferrer">
							<CardContent className="p-3 sm:p-4">
								<div className="flex gap-3 sm:gap-4">
									{/* Vote count */}
									<div className="flex flex-col items-center justify-start gap-1 min-w-[40px] sm:min-w-[48px]">
										<ArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
										<span className="text-xs sm:text-sm font-semibold">{formatScore(post.score)}</span>
									</div>

									{/* Post content */}
									<div className="flex-1 min-w-0">
										{/* Flair */}
										{post.flair && (
											<Badge variant="secondary" className="mb-2">
												{post.flair}
											</Badge>
										)}

										{/* Title */}
										<h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
											{post.title}
										</h3>

										{/* Metadata */}
										<div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
											{getPostTypeIcon(post.postType) && (
												<>
													{getPostTypeIcon(post.postType)}
													<span>•</span>
												</>
											)}
											<span>u/{post.author}</span>
											<span>•</span>
											<span>{formatTimeAgo(post.createdAt)}</span>
											<span>•</span>
											<div className="flex items-center gap-1">
												<MessageSquareIcon className="w-3 h-3" />
												<span>{post.commentCount} comments</span>
											</div>
										</div>

										{/* Content preview */}
										{post.content && (
											<p className="mt-2 text-sm text-muted-foreground line-clamp-2">
												{post.content}
											</p>
										)}
									</div>

									{/* Thumbnail */}
									{post.thumbnail && (
										<div className="hidden sm:block w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-muted relative">
											<Image
												src={post.thumbnail}
												alt=""
												fill
												className="object-cover"
												unoptimized
												onError={(e) => {
													e.currentTarget.style.display = "none";
												}}
											/>
										</div>
									)}
								</div>
							</CardContent>
						</a>
					</Card>
				))}
			</div>
		</div>
	);
};
