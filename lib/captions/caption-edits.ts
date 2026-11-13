import type { Caption } from "@remotion/captions";
import isEqual from "lodash/isEqual";
import type { AssetResult } from "@/lib/connectors/types";

/** Retypes one word, or deletes it once cleared. */
export function editCaption(
	result: AssetResult,
	index: number,
	text: string,
): AssetResult {
	const { textTimestamps } = result;
	if (!textTimestamps) throw new Error("This result has no captions");
	const word = text.trim();
	return {
		...result,
		textTimestamps: word
			? textTimestamps.with(index, { ...textTimestamps[index], text: word })
			: textTimestamps.toSpliced(index, 1),
	};
}

export const captionsEdited = ({
	textTimestamps,
	originalTextTimestamps,
}: AssetResult): boolean => !isEqual(textTimestamps, originalTextTimestamps);

export function resetCaptions(result: AssetResult): AssetResult {
	const { originalTextTimestamps } = result;
	if (!originalTextTimestamps)
		throw new Error("These captions have no original to reset to");
	return { ...result, textTimestamps: originalTextTimestamps };
}

/** New words, or none, replace the element's, original and all. */
export function replaceCaptions(
	{
		textTimestamps: _words,
		originalTextTimestamps: _original,
		...result
	}: AssetResult,
	words?: Caption[],
): AssetResult {
	return words
		? { ...result, textTimestamps: words, originalTextTimestamps: words }
		: result;
}
