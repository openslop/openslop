import { describe, expect, it, vi } from "vitest";
import { GET } from "../route";

describe("GET /api/deployment", () => {
	it("names the deployment serving it, never from a cache", async () => {
		vi.stubEnv("NEXT_DEPLOYMENT_ID", "dpl-7");

		const res = GET();

		expect(await res.json()).toEqual({ deploymentId: "dpl-7" });
		expect(res.headers.get("Cache-Control")).toBe("no-store");
	});

	it("names none in local dev", async () => {
		vi.stubEnv("NEXT_DEPLOYMENT_ID", "");

		expect(await GET().json()).toEqual({ deploymentId: null });
	});
});
