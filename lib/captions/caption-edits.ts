import type { AssetResult, TextTimestamp } from "@/lib/connectors/types";

/** Typed text takes over the span it replaces, each word timed by its length. */
export function reviseWords(
	words: readonly TextTimestamp[],
	from: number,
	to: number,
	text: string,
): TextTimestamp[] {
	const first = words[from];
	const last = words[to - 1];
	const typed = text.split(/\s+/).filter(Boolean);
	const total = typed.reduce((sum, word) => sum + word.length, 0);
	const secPerChar = (last.end - first.start) / total;
	let at = first.start;
	const retimed = typed.map((word) => {
		const start = at;
		at += word.length * secPerChar;
		return { text: word, start, end: at };
	});
	return [...words.slice(0, from), ...retimed, ...words.slice(to)];
}

/** The first edit keeps the words as generated, so every later one can be reset to them. */
export function editCaptions(
	result: AssetResult,
	from: number,
	to: number,
	text: string,
): AssetResult {
	const { textTimestamps, generatedTextTimestamps } = result;
	if (!textTimestamps) throw new Error("This result has no captions");
	return {
		...result,
		textTimestamps: reviseWords(textTimestamps, from, to, text),
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

/** Speech to text's words replace the clip's, edits and all. */
export function withSTTResult(
	{ generatedTextTimestamps: _edits, ...clip }: AssetResult,
	{ textTimestamps }: AssetResult,
): AssetResult {
	if (!textTimestamps)
		throw new Error("This speech to text result has no words");
	return { ...clip, textTimestamps };
}

export function removeCaptions({
	textTimestamps,
	generatedTextTimestamps: _edits,
	...result
}: AssetResult): AssetResult {
	if (!textTimestamps) throw new Error("This result has no captions");
	return result;
}
