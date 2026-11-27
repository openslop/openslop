import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

type BalanceLevel = "ok" | "low" | "empty";

const LOW_BALANCE_USD = 1;

export function balanceLevel(usd: number): BalanceLevel {
	if (usd <= 0) return "empty";
	if (usd < LOW_BALANCE_USD) return "low";
	return "ok";
}

/** The signed-in user's, so the client must carry their session. */
export async function readBalanceUsd(
	supabase: SupabaseClient,
): Promise<number> {
	const { data, error } = await supabase.rpc("balance_usd");
	if (error) throw new Error(`Failed to read balance: ${error.message}`);
	// PostgREST can send a numeric as a string to keep its precision.
	return z.coerce.number().parse(data);
}
