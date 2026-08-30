"use client";

import { useSyncExternalStore } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { Emitter } from "./emitter";

/**
 * A required context for an observable store, plus the selector hook that reads
 * it. Adding a store is a provider and nothing else: how it reaches React is
 * decided here rather than restated at each one.
 */
export function createStoreContext<T extends Pick<Emitter, "subscribe">>(
	name: string,
) {
	const [Context, useStore] = createRequiredContext<T>(name);

	function useStoreSelector<S>(selector: (store: T) => S): S {
		const store = useStore();
		const read = () => selector(store);
		return useSyncExternalStore(store.subscribe, read, read);
	}

	return [Context, useStore, useStoreSelector] as const;
}
