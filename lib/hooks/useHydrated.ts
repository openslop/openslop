import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first client render, then true once
 * hydration completes. Use it to gate rendering of a persisted client
 * preference so the markup matches the server on the first pass and avoids a
 * hydration mismatch.
 */
export function useHydrated(): boolean {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);
}
