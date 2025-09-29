import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
	variable: "--font-quicksand",
	preload: true,
	adjustFontFallback: true,
});

export default function WikiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <main className={quicksand.className}>{children}</main>;
}
