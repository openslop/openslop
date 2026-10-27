import type { RenderLayout, Sequence } from "./types";

export const allSequences = ({
	series,
	sequences,
}: Pick<RenderLayout, "series" | "sequences">): Sequence[] => [
	...series,
	...Object.values(sequences).flatMap((list) => list ?? []),
];

export const secUntilNextScene = (
	{ start, duration }: Pick<Sequence, "start" | "duration">,
	series: readonly Pick<Sequence, "start">[],
): number =>
	Math.min(
		duration,
		(series.find((scene) => scene.start > start)?.start ?? Infinity) - start,
	);
