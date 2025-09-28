import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
	subsets: ["latin"], // character sets
	weight: ["300", "400", "500", "600", "700"],
	display: "swap", // control font‑display behavior
	variable: "--font-quicksand", // CSS variable
	preload: true, // true by default
	adjustFontFallback: true, // reduce layout shift
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <main className={quicksand.className}>{children}</main>;
}
