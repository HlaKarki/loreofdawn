"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/query-client";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider
			afterSignOutUrl={"https://loreofdawn.com"}
			signUpFallbackRedirectUrl={"https://loreofdawn.com"}
			signInFallbackRedirectUrl={"https://loreofdawn.com"}
		>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
				<Toaster richColors />
			</ThemeProvider>
		</ClerkProvider>
	);
}
