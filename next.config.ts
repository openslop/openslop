import type { NextConfig } from "next";

const SECURITY_HEADERS = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ hostname: "mqzeech9ugknls54.public.blob.vercel-storage.com" },
			{ hostname: "picsum.photos" },
		],
	},
	experimental: {
		optimizePackageImports: [
			"radix-ui",
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"@dnd-kit/utilities",
			"lodash",
		],
	},
	async headers() {
		return [{ source: "/:path*", headers: SECURITY_HEADERS }];
	},
};

const loadConfig = async (): Promise<NextConfig> => {
	if (process.env.ANALYZE !== "true") return nextConfig;
	const { default: withBundleAnalyzer } = await import("@next/bundle-analyzer");
	return withBundleAnalyzer({ enabled: true })(nextConfig);
};

export default loadConfig;
