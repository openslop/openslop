import { useMemo } from "react";
import { Editor } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerateScope, type GenerateScope } from "./useGenerateScope";

export function useGenerateAll(editor: Editor): GenerateScope {
	const elements = useMemo(
		() => getContentElements(editor.children),
		[editor.children],
	);
	return useGenerateScope(elements);
}
