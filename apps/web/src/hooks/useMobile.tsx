"use client";

import { useEffect, useState } from "react";

const DEFAULT_BREAKPOINT = 768;

export const useMobile = (maxWidth: number = DEFAULT_BREAKPOINT) => {
	const computeIsMobile = () => {
		if (typeof window === "undefined") return false;
		return window.innerWidth <= maxWidth;
	};

	const [isMobile, setIsMobile] = useState(computeIsMobile);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
		const handleMediaChange = (event: MediaQueryList | MediaQueryListEvent) => {
			setIsMobile(event.matches);
		};

		if (typeof mediaQuery.addEventListener === "function") {
			handleMediaChange(mediaQuery);
			mediaQuery.addEventListener("change", handleMediaChange);
			return () => mediaQuery.removeEventListener("change", handleMediaChange);
		}

		const handleResize = () => setIsMobile(computeIsMobile());
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [maxWidth]);

	return { isMobile };
};
