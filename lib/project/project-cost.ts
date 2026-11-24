"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import sum from "lodash/sum";
import { useLiveRead } from "@/lib/supabase/use-live-read";

export async function readProjectCostUsd(
	supabase: SupabaseClient,
	projectId: string,
): Promise<number> {
	const { data, error } = await supabase
		.from("jobs")
		.select("cost_usd")
		.eq("project_id", projectId)
		.not("cost_usd", "is", null);
	if (error) throw error;
	return sum(data.map((row) => Number(row.cost_usd)));
}

/** Undefined until the first read lands. */
export const useProjectCostUsd = (projectId: string): number | undefined =>
	useLiveRead(
		(supabase) => readProjectCostUsd(supabase, projectId),
		[{ table: "jobs", filter: `project_id=eq.${projectId}` }],
	);
