"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { useLiveRead } from "@/lib/supabase/use-live-read";

export async function readProjectCostUsd(
	supabase: SupabaseClient,
	projectId: string,
): Promise<number> {
	const { data, error } = await supabase.rpc("project_cost_usd", {
		project_id: projectId,
	});
	if (error) throw new Error(`Failed to read project cost: ${error.message}`);
	// PostgREST can send a numeric as a string to keep its precision.
	return z.coerce.number().parse(data);
}

/** Undefined until the first read lands. */
export const useProjectCostUsd = (projectId: string): number | undefined =>
	useLiveRead(
		(supabase) => readProjectCostUsd(supabase, projectId),
		[{ table: "jobs", filter: `project_id=eq.${projectId}` }],
	);
