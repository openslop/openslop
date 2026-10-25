import type { MouseEventHandler } from "react";

/** A press that leaves focus, and any text caret, where it is. */
export const keepFocus: MouseEventHandler<HTMLElement> = (event) =>
	event.preventDefault();
