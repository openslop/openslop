import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

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

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(
	nextConfig,
);
