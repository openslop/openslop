"use client";

import debounce from "lodash/debounce";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readBalanceUsd } from "./balance";

/** $0 until the first read lands, and if it can't be read. */
export function useBalance(): number {
	const [usd, setUsd] = useState(0);

	useEffect(() => {
		const supabase = createClient();
		let cancelled = false;
		const read = () =>
			readBalanceUsd(supabase)
				.catch(() => 0)
				.then((balance) => {
					if (!cancelled) setUsd(balance);
				});
		const reread = debounce(read, 1000, { maxWait: 1000 });
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
			);
		// supabase-js can join before the session loads and never resend the token.
		void supabase.realtime.setAuth().then(() => {
			if (!cancelled) channel.subscribe();
		});
		return () => {
			cancelled = true;
			reread.cancel();
			void supabase.removeChannel(channel);
		};
	}, []);

	return usd;
}
