import { useDeferredValue, useMemo } from "react";
import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerateScope, type GenerateScope } from "./useGenerateScope";

// Slate swaps in a new `children` array for every document edit but leaves it
// alone when only the selection moves, so its identity is the signal to rebuild
// on. `useSlateStatic` would freeze the toolbar on the document it mounted with.
const selectChildren = (editor: Editor) => editor.children;

export function useGenerateAll(): GenerateScope {
	const children = useSlateSelector(selectChildren);
	const elements = useMemo(() => getContentElements(children), [children]);
	// Counting every element is slow on a big project, so let the keystroke paint
	// first. A label one frame behind the caret reads the same.
	return useGenerateScope(useDeferredValue(elements), "project");
}
