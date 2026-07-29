export const ACCESS_CODE_LENGTH = 6;

const ALLOWED_CHAR = /^[A-Z0-9]$/;

export const emptyAccessCode = (): string[] =>
	Array<string>(ACCESS_CODE_LENGTH).fill("");

export interface CodeEntry {
	values: string[];
	/** Box to move focus to, or `null` to leave focus where it is. */
	focusIndex: number | null;
}

export const isComplete = (values: string[]): boolean =>
	values.length === ACCESS_CODE_LENGTH && values.every((v) => v !== "");

/**
 * Next state for typing into one box. `null` means the keystroke is rejected
 * and the current state stands.
 */
export function typeChar(
	values: string[],
	index: number,
	input: string,
): CodeEntry | null {
	const char = input.slice(-1).toUpperCase();
	if (char && !ALLOWED_CHAR.test(char)) return null;

	const next = [...values];
	next[index] = char;
	const advance = char !== "" && index < ACCESS_CODE_LENGTH - 1;
	return { values: next, focusIndex: advance ? index + 1 : null };
}

/** Backspace in an already-empty box clears and focuses the one before it. */
export function eraseBefore(values: string[], index: number): CodeEntry | null {
	if (values[index] || index === 0) return null;

	const next = [...values];
	next[index - 1] = "";
	return { values: next, focusIndex: index - 1 };
}

export function pasteCode(text: string): CodeEntry | null {
	const pasted = text
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "")
		.slice(0, ACCESS_CODE_LENGTH);
	if (!pasted) return null;

	const values = emptyAccessCode().map((_, i) => pasted[i] ?? "");
	return { values, focusIndex: isComplete(values) ? null : pasted.length };
}
