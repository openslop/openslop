import { describe, expect, it } from "vitest";
import { config } from "@/proxy";

const matches = (path: string) =>
	config.matcher.some((pattern) => new RegExp(`^${pattern}$`).test(path));

describe("proxy matcher", () => {
	it.each(["/", "/login", "/signup", "/projects/abc"])(
		"refreshes the session on %s",
		(path) => {
			expect(matches(path)).toBe(true);
		},
	);

	it.each([
		"/api/v1/image",
		"/api/v1/image/job-1",
		"/api/render/progress",
		"/api/queues/asset-generate",
	])("leaves %s to the route's own auth guard", (path) => {
		expect(matches(path)).toBe(false);
	});

	it.each(["/_next/static/chunk.js", "/favicon.ico", "/logo.svg"])(
		"skips static asset %s",
		(path) => {
			expect(matches(path)).toBe(false);
		},
	);
});
