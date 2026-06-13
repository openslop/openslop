"use client";

import { useSyncExternalStore } from "react";

function relativeTime(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.floor(diff / 60_000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString();
}

const subscribe = () => () => {};
const useHydrated = () =>
	useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);

// The relative label is locale/clock dependent, so server and the first client
// render show a fixed locale + UTC date (identical, no hydration mismatch) and
// only swap to the relative string once hydrated.
export function RelativeTime({ iso }: { iso: string }) {
	const label = useHydrated()
		? relativeTime(iso)
		: new Date(iso).toLocaleDateString("en-US", { timeZone: "UTC" });
	return <>{label}</>;
}
