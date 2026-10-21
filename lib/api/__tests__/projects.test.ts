import { describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({
		from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
	}),
}));

const { ownsProject } = await import("../projects");

describe("ownsProject", () => {
	it("is true for a project the caller's client can see", async () => {
		maybeSingle.mockResolvedValue({ data: { id: "p1" }, error: null });

		expect(await ownsProject("p1")).toBe(true);
	});

	it("is false for a project the caller's client cannot see", async () => {
		maybeSingle.mockResolvedValue({ data: null, error: null });

		expect(await ownsProject("p2")).toBe(false);
	});

	it("throws when the lookup fails", async () => {
		maybeSingle.mockResolvedValue({
			data: null,
			error: { message: "db down" },
		});

		await expect(ownsProject("p3")).rejects.toThrow(
			"Failed to load project: db down",
		);
	});
});
