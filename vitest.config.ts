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
				statements: 74,
				branches: 69,
				functions: 71,
				lines: 75,
			},
		},
	},
});
