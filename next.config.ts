import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ hostname: "mqzeech9ugknls54.public.blob.vercel-storage.com" },
			{ hostname: "picsum.photos" },
		],
	},
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
	outputFileTracingIncludes: {
		"/api/render": ["./.remotion/**/*"],
	},
};

export default nextConfig;
