import type { AssetResult, TextTimestamp } from "@/lib/connectors/types";

/** The typed text replaces the word and keeps its timing; clearing it deletes the word. */
export function reviseWord(
	words: readonly TextTimestamp[],
	index: number,
	text: string,
): TextTimestamp[] {
	const typed = text.trim();
	return typed
		? words.with(index, { ...words[index], text: typed })
		: words.toSpliced(index, 1);
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
