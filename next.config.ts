import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ hostname: "mqzeech9ugknls54.public.blob.vercel-storage.com" },
			{ hostname: "picsum.photos" },
		],
	},
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"radix-ui",
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"@dnd-kit/utilities",
			"lodash",
			"remotion",
			"@remotion/player",
			"@remotion/preload",
		],
	},
	outputFileTracingIncludes: {
		"/api/render": ["./.remotion/**/*"],
	},
};

const loadConfig = async (): Promise<NextConfig> => {
	if (process.env.ANALYZE !== "true") return nextConfig;
	const { default: withBundleAnalyzer } = await import("@next/bundle-analyzer");
	return withBundleAnalyzer({ enabled: true })(nextConfig);
};

export default loadConfig;
