"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTrigger,
} from "./ui/drawer";
import React from "react";
import { Textarea } from "./ui/textarea";
import { ArrowUp, X } from "lucide-react";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import Markdown from "react-markdown";
import { useAuth } from "@clerk/nextjs";
import { useCompletion } from "@ai-sdk/react";
import { makeUrl } from "@/lib/utils.api";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY_useUserDb } from "@/hooks/userUser.db";
import { UserCredits } from "./user-credits";

export const AiChat = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();
	const { completion, input, handleInputChange, complete, isLoading } = useCompletion({
		api: makeUrl("/v1/ai/ask"),
		streamProtocol: "text",
		onFinish: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEY_useUserDb] });
		},
	});

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
		<div className={"fixed bottom-3 right-3"}>
			<Drawer>
				<DrawerTrigger className="rounded-full bg-accent p-2 w-16 h-16">Ask</DrawerTrigger>
				<DrawerContent className="max-w-3xl mx-auto flex flex-col">
					<DrawerHeader>
						<div className="relative flex items-center mb-1">
							<UserCredits />
							<DialogTitle className="absolute left-1/2 -translate-x-1/2">
								Lore of Dawn Ai
							</DialogTitle>
							<DialogClose className="ml-auto" asChild>
								<Button variant={"secondary"} className="rounded-full w-8 h-8">
									<X />
								</Button>
							</DialogClose>
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
