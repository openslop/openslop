import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unicorn from "eslint-plugin-unicorn";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
		// Remotion bundle output
		".remotion/**",
	]),
	{
		// lib/ is the domain layer: it must never import from app/ (the UI layer)
		files: ["lib/**/*.{ts,tsx}"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["@/app/**", "**/app/**"],
							message:
								"lib/ must not import from app/. Move shared domain logic into lib/.",
						},
					],
				},
			],
		},
	},
	{
		// File names match their main export. Directories stay free: app/ folders are URL segments.
		plugins: { unicorn },
		ignores: [
			// shadcn CLI writes kebab-case files
			"components/ui/**",
			"app/**/{not-found,global-error,global-not-found,opengraph-image,twitter-image,apple-icon}.{ts,tsx}",
		],
		rules: {
			"unicorn/filename-case": [
				"error",
				{
					cases: { camelCase: true, pascalCase: true },
					checkDirectories: false,
				},
			],
		},
	},
	{
		rules: {
			// External fonts (Fontshare, Google Sans Flex) can't use next/font
			"@next/next/no-page-custom-font": "off",
			// Allow unused vars prefixed with _
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-non-null-assertion": "error",
		},
	},
]);

export default eslintConfig;
