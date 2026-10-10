import { useState } from "react";

/** Writes every change to Slate, and takes Slate's value only when it changes, so a stale value never overwrites what was just typed. */
export function useWriteThrough(
	value: string,
	write: (next: string) => void,
): [string, (next: string) => void] {
	const [draft, setDraft] = useState(value);
	const [seen, setSeen] = useState(value);
	if (value !== seen) {
		setSeen(value);
		setDraft(value);
	}
	return [
		draft,
		(next) => {
			setDraft(next);
			write(next);
		},
	];
}
