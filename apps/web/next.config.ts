import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	images: {
		remotePatterns: [
			{
				hostname: "akmweb.youngjoygame.com",
				protocol: "https",
				pathname: "/**",
			},
			{
				hostname: "*.redd.it",
				protocol: "https",
				pathname: "/**",
			},
			{
				hostname: "*.reddit.com",
				protocol: "https",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
