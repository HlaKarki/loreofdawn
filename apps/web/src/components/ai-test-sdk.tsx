"use client";

import { useCompletion } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@clerk/nextjs";
import { makeUrl } from "@/lib/utils.api";
import Markdown from "react-markdown";

export function AiTestSDK() {
	const { getToken } = useAuth();

	const { completion, input, handleInputChange, isLoading, complete } = useCompletion({
		api: makeUrl("/v1/ai/ask"),
		streamProtocol: "text",
		onError: (error) => {
			console.error("Stream error:", error);
		},
		onFinish: () => {
			console.log("Stream finished");
		},
	});

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const token = await getToken();

		await complete(input, {
			headers: {
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: {
				question: input,
				model: "deepseek",
				ai: true,
				stream: true,
				debug: true,
			},
		});
	};

	return (
		<div className="space-y-4 p-4 border rounded-lg">
			<h2 className="text-xl font-bold">Test AI Endpoint (SDK)</h2>
			<form onSubmit={handleFormSubmit} className="space-y-2">
				<Input
					type="text"
					value={input}
					onChange={handleInputChange}
					placeholder="Ask a question..."
					disabled={isLoading}
				/>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? "Loading..." : "Ask"}
				</Button>
			</form>
			<div className="p-4 bg-muted rounded text-sm overflow-auto max-h-96 prose prose-sm dark:prose-invert max-w-none">
				<Markdown>{completion}</Markdown>
			</div>
		</div>
	);
}
