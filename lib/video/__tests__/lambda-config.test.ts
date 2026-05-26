import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSiteName } from "../../../lib/video/lambda-config";

const originals: Record<string, string | undefined> = {};

beforeEach(() => {
	originals.VERCEL_ENV = process.env.VERCEL_ENV;
	originals.VERCEL_GIT_COMMIT_REF = process.env.VERCEL_GIT_COMMIT_REF;
	delete process.env.VERCEL_ENV;
	delete process.env.VERCEL_GIT_COMMIT_REF;
});

afterEach(() => {
	process.env.VERCEL_ENV = originals.VERCEL_ENV;
	process.env.VERCEL_GIT_COMMIT_REF = originals.VERCEL_GIT_COMMIT_REF;
});

describe("getSiteName", () => {
	it("returns the stable production name when VERCEL_ENV=production", () => {
		process.env.VERCEL_ENV = "production";
		process.env.VERCEL_GIT_COMMIT_REF = "feature/something";
		expect(getSiteName()).toBe("openslop");
	});

	it("falls back to local when no branch ref is set", () => {
		expect(getSiteName()).toBe("openslop-local");
	});

	it("slugifies a preview branch name", () => {
		process.env.VERCEL_ENV = "preview";
		process.env.VERCEL_GIT_COMMIT_REF = "umair/feature_name#1";
		expect(getSiteName()).toBe("openslop-umair-feature-name-1");
	});

	it("truncates long branch names to keep the site name bounded", () => {
		process.env.VERCEL_ENV = "preview";
		process.env.VERCEL_GIT_COMMIT_REF = "a".repeat(100);
		const name = getSiteName();
		expect(name.startsWith("openslop-")).toBe(true);
		expect(name.length).toBeLessThanOrEqual("openslop-".length + 40);
	});
});
