import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export async function GET(req: NextRequest) {
	const url = req.nextUrl;
	const hero = url.searchParams.get("data");
	const rank = url.searchParams.get("rank") ?? "overall";

	console.log({
		hero,
		rank,
	});
	const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/heroes/${hero}/${rank}`);
	const data = await response.json();

	return NextResponse.json(data);
}
