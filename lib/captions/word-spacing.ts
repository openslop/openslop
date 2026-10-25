const WRITTEN_WITHOUT_SPACES = String.raw`[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Tibetan}]`;
const ENDS_WITHOUT_SPACE = new RegExp(`${WRITTEN_WITHOUT_SPACES}$`, "u");
const STARTS_WITHOUT_SPACE = new RegExp(`^${WRITTEN_WITHOUT_SPACES}`, "u");

/** Whether a space sits between two words, which scripts like Chinese, Japanese and Thai never put there. */
export const spacedApart = (before: string, after: string): boolean =>
	!ENDS_WITHOUT_SPACE.test(before) && !STARTS_WITHOUT_SPACE.test(after);

export const joinWords = (words: readonly string[]): string =>
	words
		.map((word, index) =>
			index > 0 && spacedApart(words[index - 1], word) ? ` ${word}` : word,
		)
		.join("");
