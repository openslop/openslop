import type { Caption } from "@remotion/captions";
import type { AssetResult } from "@/lib/connectors/types";

/** Retypes one word, or deletes it once cleared, keeping the words as generated for a reset. */
export function editCaption(
	result: AssetResult,
	index: number,
	text: string,
): AssetResult {
	const { textTimestamps, generatedTextTimestamps } = result;
	if (!textTimestamps) throw new Error("This result has no captions");
	const word = text.trim();
	return {
		...result,
		textTimestamps: word
			? textTimestamps.with(index, { ...textTimestamps[index], text: word })
			: textTimestamps.toSpliced(index, 1),
		generatedTextTimestamps: generatedTextTimestamps ?? textTimestamps,
	};
}

export function resetCaptions({
	generatedTextTimestamps,
	...result
}: AssetResult): AssetResult {
	if (!generatedTextTimestamps)
		throw new Error("These captions have no edits to reset");
	return { ...result, textTimestamps: generatedTextTimestamps };
}

/** New words, or none, replace the element's along with their edits. */
export function replaceCaptions(
	{
		textTimestamps: _words,
		generatedTextTimestamps: _edits,
		...result
	}: AssetResult,
	words?: Caption[],
): AssetResult {
	return words ? { ...result, textTimestamps: words } : result;
}
