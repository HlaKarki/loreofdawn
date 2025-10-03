"use client";

import Link from "next/link";

export default function Home() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<Link href="/wiki">Wiki Page</Link>
		</div>
	);
}
