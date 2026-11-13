import type { NextConfig } from "next";
import { BLOB_BASE_URL } from "./lib/blob";

// Must track the same blob URLs lib/blob.ts + lib/api/asset-bundle.ts read —
// an unlisted hostname 404s in an optimized <Image> (e.g. ProjectsList).
const blobHostnames = Array.from(
	new Set(
		[process.env.NEXT_PUBLIC_BLOB_URL, BLOB_BASE_URL]
			.filter((url): url is string => Boolean(url))
			.map((url) => new URL(url).hostname),
	),
);

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
	devIndicators: { position: "bottom-right" },
	images: {
		remotePatterns: [
			...blobHostnames.map((hostname) => ({
				protocol: "https" as const,
				hostname,
			})),
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
