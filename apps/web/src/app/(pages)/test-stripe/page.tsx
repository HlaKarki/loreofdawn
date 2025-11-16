"use client";

import { makeUrl } from "@/lib/utils.api";
import { useAuth } from "@clerk/nextjs";
import { useState, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

function TestStripeContent() {
	const { getToken } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();

	// Fetch current subscription status
	const { data: subscriptionStatus } = useQuery({
		queryKey: ["subscription-status"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");

			const response = await fetch(makeUrl("/v1/subscription/status"), {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.ok) throw new Error("Failed to fetch status");
			return response.json();
		},
	});

	// Checkout mutation
	const checkoutMutation = useMutation({
		mutationFn: async (tier: "master" | "mythical") => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");

			const response = await fetch(makeUrl("/v1/subscription/checkout"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					tier,
					successUrl: `${window.location.origin}/test-stripe?success=true`,
					cancelUrl: `${window.location.origin}/test-stripe?canceled=true`,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw { ...data, usePortal: data.usePortal };
			}
			return data;
		},
		onSuccess: (data) => {
			if (data.url) {
				window.location.href = data.url;
			}
		},
		onError: (err: any) => {
			if (err.usePortal) {
				portalMutation.mutate();
			} else {
				setError(err.error || "Failed to create checkout session");
			}
		},
	});

	// Portal mutation
	const portalMutation = useMutation({
		mutationFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");

			const response = await fetch(makeUrl("/v1/subscription/portal"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					returnUrl: `${window.location.origin}/test-stripe`,
				}),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Failed to create portal session");
			return data;
		},
		onSuccess: (data) => {
			if (data.url) {
				window.location.href = data.url;
			}
		},
		onError: (err: any) => {
			setError(err.message || "Failed to open customer portal");
		},
	});

	const handleCheckout = (tier: "master" | "mythical") => {
		setError(null);
		checkoutMutation.mutate(tier);
	};

	const handleManageSubscription = () => {
		setError(null);
		portalMutation.mutate();
	};

	// Check for success/cancel query params
	const success = searchParams.get("success");
	const canceled = searchParams.get("canceled");

	const isLoading = checkoutMutation.isPending || portalMutation.isPending;

	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Test Stripe Checkout</h1>

			{success && (
				<div className="border px-4 py-3 rounded mb-4">
					✅ Checkout successful! Check your worker logs for webhook events.
				</div>
			)}

			{canceled && <div className="border px-4 py-3 rounded mb-4">⚠️ Checkout canceled</div>}

			{error && <div className="border px-4 py-3 rounded mb-4">❌ Error: {error}</div>}

			{subscriptionStatus?.tier && subscriptionStatus.tier !== "free" && (
				<div className="border px-4 py-3 rounded mb-4">
					📊 Current Tier: <strong>{subscriptionStatus.tier}</strong> (
					{subscriptionStatus.credits_remaining}/{subscriptionStatus.credits_total} credits)
					<button
						onClick={handleManageSubscription}
						disabled={isLoading}
						className="ml-4 border px-4 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
					>
						Manage Subscription
					</button>
				</div>
			)}

			<div className="space-y-4">
				<div className="border rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-2">Master Tier</h2>
					<p className="mb-4">Test the master subscription</p>
					<button
						onClick={() => handleCheckout("master")}
						disabled={isLoading}
						className="border px-6 py-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? "Loading..." : "Subscribe to Master"}
					</button>
				</div>

				<div className="border rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-2">Mythical Tier</h2>
					<p className="mb-4">Test the mythical subscription</p>
					<button
						onClick={() => handleCheckout("mythical")}
						disabled={isLoading}
						className="border px-6 py-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? "Loading..." : "Subscribe to Mythical"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function TestStripePage() {
	return (
		<Suspense fallback={<div className="container mx-auto max-w-3xl px-4 py-8">Loading...</div>}>
			<TestStripeContent />
		</Suspense>
	);
}
