import { useState } from "react";

/** Writes every change to Slate and takes Slate's value only when it changes, so a stale value never overwrites what was just typed; `replaced` counts the times Slate's value replaced the typed one. */
export function useWriteThrough(
	value: string,
	write: (next: string) => void,
): [string, (next: string) => void, number] {
	const [state, setState] = useState({
		draft: value,
		seen: value,
		replaced: 0,
	});
	if (value !== state.seen)
		setState({
			draft: value,
			seen: value,
			replaced: value === state.draft ? state.replaced : state.replaced + 1,
		});
	return [
		state.draft,
		(next) => {
			setState((last) => ({ ...last, draft: next }));
			write(next);
		},
		state.replaced,
	];
}
