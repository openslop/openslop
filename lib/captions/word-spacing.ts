const WRITTEN_WITHOUT_SPACES = String.raw`[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Tibetan}]`;
const ENDS_WITHOUT_SPACE = new RegExp(`${WRITTEN_WITHOUT_SPACES}$`, "u");
const STARTS_WITHOUT_SPACE = new RegExp(`^${WRITTEN_WITHOUT_SPACES}`, "u");

const spacedApart = (before: string, after: string): boolean =>
	!ENDS_WITHOUT_SPACE.test(before) && !STARTS_WITHOUT_SPACE.test(after);

/** Whether each word takes a space before it, which scripts like Chinese, Japanese and Thai never put there. */
export const spacesBefore = (words: readonly string[]): boolean[] =>
	words.map((word, index) => index > 0 && spacedApart(words[index - 1], word));

export const joinWords = (words: readonly string[]): string => {
	const spaced = spacesBefore(words);
	return words
		.map((word, index) => (spaced[index] ? ` ${word}` : word))
		.join("");
};
