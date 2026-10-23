"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Descendant } from "slate";
import { useSlateStatic } from "slate-react";
import { diffCanvas, type HandEdits } from "./hand-edits";

/** Keeps the canvas as it stood each time Sloppy settled, and reads what the user changed by hand since. */
export function useHandEdits(settled: boolean): () => HandEdits | null {
	const editor = useSlateStatic();
	const settledCanvas = useRef<Descendant[]>(null);

	useEffect(() => {
		if (settled) settledCanvas.current = editor.children;
	}, [settled, editor]);

	return useCallback(
		() =>
			settledCanvas.current &&
			diffCanvas(settledCanvas.current, editor.children),
		[editor],
	);
}
