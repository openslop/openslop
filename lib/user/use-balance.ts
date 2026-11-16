"use client";

import debounce from "lodash/debounce";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readBalanceUsd } from "./balance";

/** Null until the first read lands, $0 if it can't be read. */
export function useBalance(): number | null {
	const [usd, setUsd] = useState<number | null>(null);

	useEffect(() => {
		const supabase = createClient();
		let cancelled = false;
		const read = () =>
			readBalanceUsd(supabase)
				.catch(() => 0)
				.then((balance) => {
					if (!cancelled) setUsd(balance);
				});
		const reread = debounce(read, 5000, { maxWait: 5000 });
		read();
		// Row-level security already limits these to the user's own rows.
		const channel = supabase
			.channel(`balance:${crypto.randomUUID()}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "jobs",
					filter: "cost_usd=gt.0",
				},
				reread,
			)
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "funds" },
				reread,
			)
			.subscribe();
		return () => {
			cancelled = true;
			reread.cancel();
			void supabase.removeChannel(channel);
		};
	}, []);

	return usd;
}
