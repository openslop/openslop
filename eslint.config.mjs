import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unicorn from "eslint-plugin-unicorn";

const LIB_TO_APP = {
	group: ["@/app/**", "**/app/**"],
	message:
		"lib/ must not import from app/. Move shared domain logic into lib/.",
};

const MEDIA_UPLOAD = {
	group: ["@/lib/upload/use-file-upload", "**/use-file-upload"],
	message: "User uploads land in the project's media: use useMediaUpload.",
};

const restrictImports = (...patterns) => ({
	"no-restricted-imports": ["error", { patterns }],
});

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
		rules: restrictImports(LIB_TO_APP, MEDIA_UPLOAD),
	},
	{
		files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
		rules: restrictImports(MEDIA_UPLOAD),
	},
	{
		files: ["lib/project/use-media-upload.ts", "lib/upload/**/*.{ts,tsx}"],
		rules: restrictImports(LIB_TO_APP),
	},
	{
		plugins: { unicorn },
		rules: {
			"unicorn/filename-case": [
				"error",
				{ case: "kebabCase", checkDirectories: false },
			],
		},
	},
	{
		settings: { "import/ignore": ["node_modules"] },
		rules: {
			// External fonts (Fontshare, Google Sans Flex) can't use next/font
			"@next/next/no-page-custom-font": "off",
			// Allow unused vars prefixed with _
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-non-null-assertion": "error",
			// A runtime import cycle loads only by hoisting luck
			"import/no-cycle": "error",
		},
	},
	{
		files: ["**/__tests__/**", "**/*.test.{ts,tsx}"],
		rules: { "@typescript-eslint/no-non-null-assertion": "off" },
	},
]);

export default eslintConfig;
