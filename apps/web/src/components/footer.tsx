import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t mt-16">
			<div className="container mx-auto max-w-3xl px-4 py-8">
				<div className="flex flex-col items-center gap-6 text-center">
					{/* Disclaimer */}
					<div className="text-xs text-muted-foreground max-w-2xl">
						<p>
							This site is not endorsed by Moonton and does not reflect the views or opinions of
							Moonton or anyone officially involved in producing or managing Mobile Legends: Bang
							Bang. Mobile Legends: Bang Bang and Moonton are trademarks or registered trademarks of
							Moonton. Mobile Legends: Bang Bang © Moonton.
						</p>
					</div>

					{/* Copyright */}
					<div className="text-xs text-muted-foreground flex items-center gap-3">
						<span>© {new Date().getFullYear()} Lore of Dawn</span>
						<span>·</span>
						<a
							href="https://buymeacoffee.com/hlakarki"
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"inline-flex items-center p-1 px-2 rounded-4xl gap-1",
								"bg-amber-300/80 text-black",
							)}
						>
							<Coffee className="h-3 w-3" />
							Buy me coffee
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
