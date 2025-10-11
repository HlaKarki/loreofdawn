import { NextResponse } from "next/server";

export async function GET() {
	const response = await fetch(`http://localhost:1202/trpc/mlData.heroList/`);
	const data = await response.json();
	console.log("data: ", data);
	return NextResponse.json(data);
}
