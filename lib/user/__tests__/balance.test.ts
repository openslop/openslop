import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { readBalanceUsd } from "../balance";

const rpc = vi.fn();
const supabase = { rpc } as unknown as SupabaseClient;

describe("readBalanceUsd", () => {
	it("reads the user's balance", async () => {
		rpc.mockResolvedValue({ data: 3.25, error: null });

		expect(await readBalanceUsd(supabase)).toBe(3.25);
	});

	it("reads a numeric sent as a string", async () => {
		rpc.mockResolvedValue({ data: "-0.180000", error: null });

		expect(await readBalanceUsd(supabase)).toBe(-0.18);
	});

	it("throws when the query fails", async () => {
		rpc.mockResolvedValue({ data: null, error: { message: "db down" } });

		await expect(readBalanceUsd(supabase)).rejects.toThrow(
			"Failed to read balance: db down",
		);
	});
});
