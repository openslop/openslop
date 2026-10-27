const WRITTEN_WITHOUT_SPACES = String.raw`[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Tibetan}]`;
const ENDS_WITHOUT_SPACE = new RegExp(`${WRITTEN_WITHOUT_SPACES}$`, "u");
const STARTS_WITHOUT_SPACE = new RegExp(`^${WRITTEN_WITHOUT_SPACES}`, "u");

/** The space between two words, which scripts like Chinese, Japanese and Thai never put there. */
export const spaceBetween = (before: string | undefined, after: string) =>
	before === undefined ||
	ENDS_WITHOUT_SPACE.test(before) ||
	STARTS_WITHOUT_SPACE.test(after)
		? ""
		: " ";

/** Each word as running text writes it, led by the space its script takes. */
export const spacedWords = (words: readonly string[]): string[] =>
	words.map((word, index) => spaceBetween(words[index - 1], word) + word);

export const joinWords = (words: readonly string[]): string =>
	spacedWords(words).join("");
