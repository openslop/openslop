"use client";

import { useEffect, useState } from "react";
import sum from "lodash/sum";
import { createClient } from "@/lib/supabase/client";

export async function fetchProjectTotalCost(
	projectId: string,
): Promise<number> {
	const { data, error } = await createClient()
		.from("jobs")
		.select("cost_usd")
		.eq("project_id", projectId)
		.not("cost_usd", "is", null);
	if (error) throw error;
	return sum(data.map((row) => Number(row.cost_usd)));
}

/** Undefined until the first read lands. */
export function useProjectTotalCost(projectId: string): number | undefined {
	const [totalCost, setTotalCost] = useState<number>();

	useEffect(() => {
		let cancelled = false;
		fetchProjectTotalCost(projectId)
			.then((cost) => {
				if (!cancelled) setTotalCost(cost);
			})
			.catch((error: unknown) =>
				console.error("Failed to read project cost", error),
			);
		return () => {
			cancelled = true;
		};
	}, [projectId]);

	return totalCost;
}
