import mapValues from "lodash/mapValues";
import { captionSourceOf, isCaptionable } from "@/lib/canvas/types";
import { layoutSequences, secUntilNextScene } from "./sequences";
import type { RenderLayout, Sequence } from "./types";

type Layout = Pick<RenderLayout, "series" | "sequences">;

const overlaps = (a: Sequence, b: Sequence) =>
	a.start < b.start + b.duration && b.start < a.start + a.duration;

const isSpeech = ({ element }: Sequence) =>
	captionSourceOf(element.type) === "speech";

const spokenOver = (sequence: Sequence, speech: Sequence[]) =>
	captionSourceOf(sequence.element.type) === "video" &&
	speech.some((other) => overlaps(sequence, other));

/** The sequences that show captions once every speech has words, so a muted video never needs any. */
export function captionableSequences(layout: Layout): Sequence[] {
	const sequences = layoutSequences(layout);
	const speech = sequences.filter(isSpeech);
	return sequences.filter(
		(sequence) =>
			isCaptionable(sequence.element.type) && !spokenOver(sequence, speech),
	);
}

/** Speech is always captioned, a video only with no speech over it; captions stop by where the next scene begins. */
export function withCaptionRule(layout: Layout): Layout {
	const speech = layoutSequences(layout).filter(
		(sequence) => sequence.element.captions && isSpeech(sequence),
	);
	const layOut = (sequence: Sequence): Sequence => {
		const { captions } = sequence.element;
		return {
			...sequence,
			element: {
				...sequence.element,
				captions:
					captions && !spokenOver(sequence, speech)
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
