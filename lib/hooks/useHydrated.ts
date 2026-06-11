import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** False during SSR and the first client render, true after hydration; gates persisted client prefs to avoid a hydration mismatch. */
export function useHydrated(): boolean {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);
}
