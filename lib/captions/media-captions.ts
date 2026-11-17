import type { Caption } from "@remotion/captions";
import type { MediaItem } from "@/lib/project/media";

const inFlight = new Map<string, Promise<Caption[]>>();

/** Reuses a saved transcript or a request already running for this file. */
export function getMediaCaptions(
	item: MediaItem,
	transcribe: () => Promise<Caption[]>,
): Promise<Caption[]> {
	if (item.kind === "image")
		return Promise.reject(new Error(`${item.name} has no audio to caption.`));
	if (item.captions !== undefined) return Promise.resolve(item.captions);

	const current = inFlight.get(item.url);
	if (current) return current;

	const pending = Promise.resolve()
		.then(transcribe)
		.finally(() => inFlight.delete(item.url));
	inFlight.set(item.url, pending);
	return pending;
}
