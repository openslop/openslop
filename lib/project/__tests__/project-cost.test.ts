import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { readProjectCostUsd } from "../project-cost";

const jobsAnswering = (result: { data: unknown; error: unknown }) => {
	const not = vi.fn().mockResolvedValue(result);
	const eq = vi.fn().mockReturnValue({ not });
	const supabase = {
		from: () => ({ select: () => ({ eq }) }),
	} as unknown as SupabaseClient;
	return { supabase, eq, not };
};

describe("readProjectCostUsd", () => {
	it("sums the project's costed jobs", async () => {
		const { supabase, eq, not } = jobsAnswering({
			data: [{ cost_usd: 0.15 }, { cost_usd: 0.25 }, { cost_usd: 0.02 }],
			error: null,
		});

		expect(await readProjectCostUsd(supabase, "proj-1")).toBeCloseTo(0.42);
		expect(eq).toHaveBeenCalledWith("project_id", "proj-1");
		expect(not).toHaveBeenCalledWith("cost_usd", "is", null);
	});

	it("is zero when no job has a cost", async () => {
		const { supabase } = jobsAnswering({ data: [], error: null });

		expect(await readProjectCostUsd(supabase, "proj-2")).toBe(0);
	});

	it("throws when the query fails", async () => {
		const { supabase } = jobsAnswering({
			data: null,
			error: new Error("db failure"),
		});

		await expect(readProjectCostUsd(supabase, "proj-3")).rejects.toThrow(
			"db failure",
		);
	});
});
