"use client";

import { useSyncExternalStore } from "react";
import { noSubscription } from "./use-client-value";

const everySecond = (notify: () => void) => {
	const timer = setInterval(notify, 1000);
	return () => clearInterval(timer);
};

export function useElapsedSeconds(startedAt: number | null): number {
	return useSyncExternalStore(
		startedAt === null ? noSubscription : everySecond,
		() =>
			startedAt === null ? 0 : Math.trunc((Date.now() - startedAt) / 1000),
		() => 0,
	);
}
