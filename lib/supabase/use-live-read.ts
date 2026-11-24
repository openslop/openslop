"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import debounce from "lodash/debounce";
import { useEffect, useEffectEvent, useState } from "react";
import { createClient } from "./client";

type Watch = { table: string; filter?: string };

/** Undefined until the first read lands; reads again whenever a watched table changes. */
export function useLiveRead<T>(
	read: (supabase: SupabaseClient) => Promise<T>,
	watches: Watch[],
): T | undefined {
	const [value, setValue] = useState<T>();
	const readLatest = useEffectEvent(read);
	const watchKey = JSON.stringify(watches);

	useEffect(() => {
		const supabase = createClient();
		let cancelled = false;
		const reload = () =>
			readLatest(supabase)
				.then((next) => {
					if (!cancelled) setValue(next);
				})
				.catch((error: unknown) => console.error("Live read failed", error));
		const reloadSoon = debounce(reload, 1000, { maxWait: 1000 });
		void reload();
		// Row-level security already limits these to the user's own rows.
		const watched: Watch[] = JSON.parse(watchKey);
		const channel = watched.reduce(
			(subscribed, watch) =>
				subscribed.on(
					"postgres_changes",
					{ event: "*", schema: "public", ...watch },
					reloadSoon,
				),
			supabase.channel(`live:${crypto.randomUUID()}`),
		);
		// supabase-js can join before the session loads and never resend the token.
		void supabase.realtime.setAuth().then(() => {
			if (!cancelled) channel.subscribe();
		});
		return () => {
			cancelled = true;
			reloadSoon.cancel();
			void supabase.removeChannel(channel);
		};
	}, [watchKey]);

	return value;
}
