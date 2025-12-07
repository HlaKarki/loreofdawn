"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./ui/drawer";
import React from "react";
import { Textarea } from "./ui/textarea";
import { ArrowUp, X } from "lucide-react";
import Markdown from "react-markdown";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useCompletion } from "@ai-sdk/react";
import { makeUrl } from "@/lib/utils.api";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY_useUserDb } from "@/hooks/userUser.db";
import { UserCredits } from "./user-credits";
import { motion } from "motion/react";

export const AiChat = () => {
	const { getToken, isSignedIn } = useAuth();
	const { redirectToSignIn } = useClerk();
	const queryClient = useQueryClient();
	const [open, setOpen] = React.useState(false);
	const { completion, input, handleInputChange, complete, isLoading } = useCompletion({
		api: makeUrl("/v1/ai/ask"),
		streamProtocol: "text",
		onFinish: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY_useUserDb] });
		},
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen && !isSignedIn) {
			redirectToSignIn({
				signInFallbackRedirectUrl: window.location.href,
				signUpFallbackRedirectUrl: window.location.href,
			});
			return;
		}
		setOpen(nextOpen);
	};

	const handleAskQuestion = async () => {
		const token = await getToken();
		await complete(input, {
			headers: {
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: { question: input },
		});
	};

	return (
		<div className={"fixed bottom-4 right-4 z-50"}>
			<Drawer open={open} onOpenChange={handleOpenChange}>
				<DrawerTrigger asChild>
					<div className="relative flex items-center justify-center group">
						<motion.span
							className="absolute h-[90px] w-[90px] rounded-full bg-primary/5 blur-xl"
							animate={{ scale: [1, 1.08, 1] }}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>

						{/* Main pulse */}
						<motion.span
							className="absolute h-[65px] w-[65px] rounded-full border border-primary/30"
							animate={{
								opacity: [0.3, 0.7, 0.3],
								scale: [1, 1.06, 1],
							}}
							transition={{
								duration: 2.2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>

						<motion.span
							className="absolute h-[75px] w-[75px] rounded-full border border-primary/20"
							animate={{
								opacity: [0, 0.3, 0],
								scale: [1, 1.3],
							}}
							transition={{
								duration: 2.6,
								repeat: Infinity,
								ease: "easeOut",
							}}
						/>

						<Button
							type="button"
							className={cn(
								"relative size-[60px] rounded-full",
								"bg-background/60 text-primary border border-primary/20",
								"hover:bg-primary/20 hover:border-primary/30",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
								"text-xs",
							)}
						>
							<div className="flex flex-col items-center gap-0.5">
								<span>ASK</span>
								<span className="text-[10px] text-muted-foreground font-normal group-hover:text-primary">
									DAWN
								</span>
							</div>
						</Button>
					</div>
				</DrawerTrigger>
				<DrawerContent className="max-w-3xl mx-auto flex flex-col">
					<DrawerHeader>
						<div className="relative flex items-center mb-1">
							<UserCredits />
							<DrawerTitle className="absolute left-1/2 -translate-x-1/2">
								Lore of Dawn Ai
							</DrawerTitle>
							<DrawerClose className="ml-auto" asChild>
								<Button variant={"secondary"} className="rounded-full w-8 h-8">
									<X />
								</Button>
							</DrawerClose>
						</div>
					</DrawerHeader>
					<AiMessages key={completion.length} aiResponse={completion} />
					<DrawerFooter>
						<div className="flex gap-3 items-center justify-center">
							<Textarea
								autoFocus={false}
								value={input}
								placeholder="Which are the top 5 meta picks for assasin?"
								onChange={handleInputChange}
								disabled={isLoading}
								autoCorrect="off"
								autoComplete="off"
							/>
							<Button
								onClick={handleAskQuestion}
								type="submit"
								disabled={isLoading}
								className="ml-auto rounded-full w-10 h-10"
							>
								<ArrowUp>Ask</ArrowUp>
							</Button>
						</div>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
};

const AiMessages = ({ aiResponse }: { aiResponse: string }) => {
	const scrollRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [aiResponse]);

	return (
		<div
			ref={scrollRef}
			className="text-left px-4 pb-2 h-[40vh] overflow-y-auto [overflow-scrolling:touch]"
		>
			<div
				className={cn(
					"pr-4",
					"prose prose-sm max-w-none",
					"prose-headings:font-semibold prose-headings:text-foreground",
					"prose-p:text-muted-foreground prose-p:leading-relaxed",
					"prose-a:text-primary prose-a:underline",
					"prose-strong:text-foreground prose-strong:font-semibold",
					"prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
					"prose-pre:bg-muted prose-pre:text-foreground",
					"prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
					"prose-li:marker:text-muted-foreground",
				)}
			>
				<Markdown>{aiResponse}</Markdown>
			</div>
		</div>
	);
};
