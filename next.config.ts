import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
	outputFileTracingIncludes: {
		"/api/render": ["./.remotion/**/*"],
	},
};

export default nextConfig;
