"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AiTestSDK } from "@/components/ai-test-sdk";

export default function LoginPage() {
	return (
		<div className="flex items-center justify-center h-full p-4">
			<SignedOut>
				<div className="flex flex-col gap-4 p-8 border rounded-lg shadow-lg">
					<h1 className="text-2xl font-bold text-center">Welcome to Lore of Dawn</h1>
					<SignInButton mode="modal">
						<Button variant="default" size="lg">
							Sign In
						</Button>
					</SignInButton>
					<SignUpButton mode="modal">
						<Button variant="outline" size="lg">
							Sign Up
						</Button>
					</SignUpButton>
				</div>
			</SignedOut>
			<SignedIn>
				<div className="flex flex-col gap-4 max-w-2xl w-full">
					<div className="flex items-center justify-between">
						<p className="text-lg">You're signed in!</p>
						<UserButton />
					</div>
					<AiTestSDK />
				</div>
			</SignedIn>
		</div>
	);
}
