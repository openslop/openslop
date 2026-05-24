import path from "node:path";
import { enableTailwind } from "@remotion/tailwind-v4";
import type { WebpackOverrideFn } from "@remotion/bundler";

export const webpackOverride: WebpackOverrideFn = (currentConfig) => {
	const withTailwind = enableTailwind(currentConfig);
	return {
		...withTailwind,
		resolve: {
			...withTailwind.resolve,
			alias: {
				...(withTailwind.resolve?.alias ?? {}),
				"@": path.resolve(process.cwd()),
			},
		},
	};
};
