import type { RenderLayout, Sequence } from "./types";

export const allSequences = ({
	series,
	sequences,
}: Pick<RenderLayout, "series" | "sequences">): Sequence[] => [
	...series,
	...Object.values(sequences).flatMap((list) => list ?? []),
];
