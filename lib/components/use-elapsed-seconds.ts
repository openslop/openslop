"use client";

import { useSyncExternalStore } from "react";

const everySecond = (notify: () => void) => {
	const timer = setInterval(notify, 1000);
	return () => clearInterval(timer);
};

const never = () => () => {};

export function useElapsedSeconds(startedAt: number | null): number {
	return useSyncExternalStore(
		startedAt === null ? never : everySecond,
		() =>
			startedAt === null ? 0 : Math.trunc((Date.now() - startedAt) / 1000),
		() => 0,
	);
}
