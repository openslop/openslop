import mapValues from "lodash/mapValues";
import { captionSourceOf } from "@/lib/canvas/types";
import { layoutSequences, secUntilNextScene } from "./sequences";
import type { RenderLayout, Sequence } from "./types";

type Layout = Pick<RenderLayout, "series" | "sequences">;

const overlaps = (a: Sequence, b: Sequence) =>
	a.start < b.start + b.duration && b.start < a.start + a.duration;

/** Speech is always captioned, a video only with no speech over it; captions stop by where the next scene begins. */
export function withCaptionRule(layout: Layout): Layout {
	const speech = layoutSequences(layout).filter(
		({ element }) =>
			element.captions && captionSourceOf(element.type) === "speech",
	);
	const layOut = (sequence: Sequence): Sequence => {
		const { captions, type } = sequence.element;
		const spokenOver =
			captionSourceOf(type) === "video" &&
			speech.some((other) => overlaps(sequence, other));
		return {
			...sequence,
			element: {
				...sequence.element,
				captions:
					captions && !spokenOver
						? {
								...captions,
								untilSec: Math.min(
									captions.untilSec,
									secUntilNextScene(sequence, layout.series),
								),
							}
						: undefined,
			},
		};
	};
	return {
		series: layout.series.map(layOut),
		sequences: mapValues(layout.sequences, (list) => list?.map(layOut)),
	};
}
