import type { Caption } from "@remotion/captions";
import type { AssetResult } from "@/lib/connectors/types";

/** The typed word replaces the caption's and keeps its timing; clearing it deletes the caption. */
export function reviseWord(
	captions: readonly Caption[],
	index: number,
	text: string,
): Caption[] {
	const word = text.trim();
	if (!word) return captions.toSpliced(index, 1);
	return captions.with(index, { ...captions[index], text: word });
}

/** The first edit keeps the words as generated, so every later one can be reset to them. */
export function editCaptions(
	result: AssetResult,
	index: number,
	text: string,
): AssetResult {
	const { textTimestamps, generatedTextTimestamps } = result;
	if (!textTimestamps) throw new Error("This result has no captions");
	return {
		...result,
		textTimestamps: reviseWord(textTimestamps, index, text),
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

/** Speech to text's words replace the element's, edits and all. */
export function withSTTResult(
	{ generatedTextTimestamps: _edits, ...result }: AssetResult,
	{ textTimestamps }: AssetResult,
): AssetResult {
	if (!textTimestamps)
		throw new Error("This speech to text result has no words");
	return { ...result, textTimestamps };
}

export function removeCaptions({
	textTimestamps,
	generatedTextTimestamps: _edits,
	...result
}: AssetResult): AssetResult {
	if (!textTimestamps) throw new Error("This result has no captions");
	return result;
}
