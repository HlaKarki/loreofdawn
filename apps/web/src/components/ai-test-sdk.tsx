"use client";

import { useCompletion } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@clerk/nextjs";
import { makeUrl } from "@/lib/utils.api";
import Markdown from "react-markdown";
import { useState } from "react";

export function AiTestSDK() {
	const { getToken } = useAuth();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { completion, input, handleInputChange, isLoading, complete } = useCompletion({
		api: makeUrl("/v1/ai/ask"),
		streamProtocol: "text",
		onError: (error) => {
			console.error("Stream error:", error);
			console.error("Error details:", JSON.stringify(error, null, 2));

			// Extract error details from the response
			const message = error.message || "An error occurred";

			// Check for specific error types
			if (message.includes("Insufficient credits") || message.includes("402")) {
				setErrorMessage("Insufficient credits. Please upgrade your plan to continue.");
			} else if (message.includes("Credit deduction failed") || message.includes("409")) {
				setErrorMessage("Request conflict. Please try again.");
			} else if (message.includes("Invalid token") || message.includes("401")) {
				setErrorMessage("Authentication failed. Please sign in again.");
			} else {
				setErrorMessage(`Error: ${message}`);
			}
		},
		onFinish: () => {
			console.log("Stream finished");
			setErrorMessage(null); // Clear error on success
		},
	});

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage(null); // Clear previous errors
		const token = await getToken();

		await complete(input, {
			headers: {
				Authorization: token ? `Bearer ${token}` : "",
			},
			body: {
				question: input,
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

			{errorMessage && (
				<div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
					{errorMessage}
				</div>
			)}

			<div className="p-4 bg-muted rounded text-sm overflow-auto max-h-96 prose prose-sm dark:prose-invert max-w-none">
				<Markdown>{completion}</Markdown>
			</div>
		</div>
	);
}
