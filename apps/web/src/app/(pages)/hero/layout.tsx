import { Quicksand } from "next/font/google";
import { cn } from "@/lib/utils";

const quicksand = Quicksand({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
	variable: "--font-quicksand",
	preload: true,
	adjustFontFallback: true,
});

export default function HeroLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <main className={cn(quicksand.className)}>{children}</main>;
}