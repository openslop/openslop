"use client";

import { useCallback, useSyncExternalStore } from "react";

type Media = HTMLMediaElement | HTMLImageElement;

const SETTLE_EVENTS = ["load", "loadedmetadata", "error", "emptied"] as const;

const isSettled = (media: Media) =>
	media instanceof HTMLImageElement
		? media.complete
		: media.error !== null ||
			media.readyState >= HTMLMediaElement.HAVE_METADATA;

/**
 * Whether media has loaded (its metadata, for audio and video) or failed,
 * read from the element itself so a load that finished before hydration
 * still counts.
 */
export function useMediaSettled(media: Media | null): boolean {
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
		() => media !== null && isSettled(media),
		() => false,
	);
}
