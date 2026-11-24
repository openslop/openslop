import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { readProjectCostUsd } from "../project-cost";

const rpc = vi.fn();
const supabase = { rpc } as unknown as SupabaseClient;

describe("readProjectCostUsd", () => {
	it("reads what the project has spent", async () => {
		rpc.mockResolvedValue({ data: 0.42, error: null });

		expect(await readProjectCostUsd(supabase, "proj-1")).toBe(0.42);
		expect(rpc).toHaveBeenCalledWith("project_cost_usd", {
			project_id: "proj-1",
		});
	});

	it("reads a numeric sent as a string", async () => {
		rpc.mockResolvedValue({ data: "0.180000", error: null });

		expect(await readProjectCostUsd(supabase, "proj-1")).toBe(0.18);
	});

	it("throws when the query fails", async () => {
		rpc.mockResolvedValue({ data: null, error: { message: "db down" } });

		await expect(readProjectCostUsd(supabase, "proj-1")).rejects.toThrow(
			"Failed to read project cost: db down",
		);
	});
});
