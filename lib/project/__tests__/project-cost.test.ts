import { describe, expect, it, vi } from "vitest";

const { select } = vi.hoisted(() => ({
	select: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({
		from: () => ({
			select,
		}),
	}),
}));

import { fetchProjectTotalCost } from "../project-cost";

describe("fetchProjectTotalCost", () => {
	it("sums cost_usd of jobs for the project", async () => {
		const notFn = vi.fn().mockResolvedValue({
			data: [{ cost_usd: 0.15 }, { cost_usd: 0.25 }, { cost_usd: 0.02 }],
			error: null,
		});
		const eqFn = vi.fn().mockReturnValue({ not: notFn });
		select.mockReturnValue({ eq: eqFn });

		const cost = await fetchProjectTotalCost("proj-1");
		expect(cost).toBeCloseTo(0.42);
		expect(eqFn).toHaveBeenCalledWith("project_id", "proj-1");
		expect(notFn).toHaveBeenCalledWith("cost_usd", "is", null);
	});

	it("is zero when no costed jobs exist", async () => {
		const notFn = vi.fn().mockResolvedValue({
			data: [],
			error: null,
		});
		const eqFn = vi.fn().mockReturnValue({ not: notFn });
		select.mockReturnValue({ eq: eqFn });

		expect(await fetchProjectTotalCost("proj-2")).toBe(0);
	});

	it("throws when query errors", async () => {
		const notFn = vi.fn().mockResolvedValue({
			data: null,
			error: new Error("db failure"),
		});
		const eqFn = vi.fn().mockReturnValue({ not: notFn });
		select.mockReturnValue({ eq: eqFn });

		await expect(fetchProjectTotalCost("proj-3")).rejects.toThrow("db failure");
	});
});
