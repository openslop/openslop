import type { RenderLayout, Sequence } from "./types";

export const allSequences = ({
	series,
	sequences,
}: Pick<RenderLayout, "series" | "sequences">): Sequence[] => [
	...series,
	...Object.values(sequences).flatMap((list) => list ?? []),
];

/** How long past what plays its slot stays open. */
export const extensionDuration = (
	{ minDuration }: Pick<Sequence, "minDuration">,
	duration: number,
): number => Math.max(0, minDuration - duration);

/** The whole slot: what plays and its extension. */
export const totalDuration = ({
	duration,
	minDuration,
}: Pick<Sequence, "duration" | "minDuration">): number =>
	Math.max(duration, minDuration);
