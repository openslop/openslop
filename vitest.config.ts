import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
	test: {
		setupFiles: ["./vitest.setup.ts"],
		exclude: [...configDefaults.exclude, "e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary"],
			include: ["lib/**", "app/api/**"],
			thresholds: {
				statements: 86,
				branches: 83,
				functions: 84,
				lines: 87,
			},
		},
	},
});
