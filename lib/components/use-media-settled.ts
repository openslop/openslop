"use client";

import { useCallback, useSyncExternalStore } from "react";

const SETTLE_EVENTS = ["loadedmetadata", "error", "emptied"] as const;

/**
 * Whether media has loaded its metadata or failed, read from the element
 * itself so a load that finished before hydration still counts.
 */
export function useMediaSettled(media: HTMLMediaElement | null): boolean {
	const subscribe = useCallback(
		(notify: () => void) => {
			if (!media) return () => {};
			for (const event of SETTLE_EVENTS) media.addEventListener(event, notify);
			return () => {
				for (const event of SETTLE_EVENTS)
					media.removeEventListener(event, notify);
			};
		},
		[media],
	);
	return useSyncExternalStore(
		subscribe,
		() =>
			media !== null &&
			(media.error !== null ||
				media.readyState >= HTMLMediaElement.HAVE_METADATA),
		() => false,
	);
}
