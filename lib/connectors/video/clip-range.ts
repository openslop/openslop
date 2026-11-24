import { getTrimEnd, getTrimStart } from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";

/** The part of a video a clip plays, in seconds from the start of its media. Without one the whole video plays. */
export type ClipRange = { startSec: number; endSec?: number };

/** The range a trimmed clip plays; none for a clip that plays its whole media. */
export function clipRange(element: ContentElement): ClipRange | undefined {
	const startSec = getTrimStart(element);
	const endSec = getTrimEnd(element);
	const range = { startSec, ...(endSec !== undefined && { endSec }) };
	return playsWhole(range) ? undefined : range;
}

export const playsWhole = (range: ClipRange | undefined) =>
	!range || (range.startSec === 0 && range.endSec === undefined);
