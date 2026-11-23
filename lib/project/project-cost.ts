"use client";

import { useEffect, useState } from "react";
import sum from "lodash/sum";
import { createClient } from "@/lib/supabase/client";

export async function fetchProjectTotalCost(
	projectId: string,
): Promise<number | undefined> {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("jobs")
		.select("cost_usd")
		.eq("project_id", projectId)
		.not("cost_usd", "is", null);
	if (error) throw error;
	const costs = (data ?? []).flatMap(
		(row: { cost_usd: number | string | null }) =>
			row.cost_usd != null ? [Number(row.cost_usd)] : [],
	);
	return costs.length > 0 ? sum(costs) : undefined;
}

export function useProjectTotalCost(
	projectId: string | undefined,
): number | undefined {
	const [totalCost, setTotalCost] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (!projectId) return;
		let cancelled = false;
		void fetchProjectTotalCost(projectId)
			.then((cost) => {
				if (!cancelled) setTotalCost(cost);
			})
			.catch((error: unknown) => {
				console.error("Failed to fetch project total cost", error);
			});
		return () => {
			cancelled = true;
		};
	}, [projectId]);

	return projectId ? totalCost : undefined;
}
