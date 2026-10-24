import { useSlateSelector } from "slate-react";
import { findElementById } from "@/lib/canvas/editor-ops";
import { getVolumeGain } from "@/lib/canvas/element-attributes";

/** The gain an element's audio previews play at, following edits to its Volume. */
export function useVolumeGain(elementId: string): number {
	return useSlateSelector((editor) =>
		getVolumeGain(findElementById(editor, elementId)?.[0] ?? {}),
	);
}
