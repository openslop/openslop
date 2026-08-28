import { useCallback } from "react";
import { Editor } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerateElements } from "./useGenerateElements";

export function useGenerateAll(editor: Editor) {
	const generateElements = useGenerateElements();

	const generateAll = useCallback(
		() => generateElements(getContentElements(editor.children)),
		[generateElements, editor],
	);

	return { generateAll };
}
