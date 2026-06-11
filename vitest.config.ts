import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
	test: {
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary"],
			include: ["lib/**", "app/api/**"],
			thresholds: {
				statements: 71,
				branches: 66,
				functions: 68,
				lines: 72,
			},
		},
	},
});
