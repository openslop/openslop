import { useSlateSelector, useSlateStatic } from "slate-react";
import { shallow } from "zustand/shallow";
import { setReferenceImages } from "@/lib/canvas/asset-ops";
import { referenceUrls } from "@/lib/canvas/assets";

export function useReferenceImages(): {
	urls: string[];
	add: (urls: string[]) => void;
	remove: (index: number) => void;
} {
	const editor = useSlateStatic();
	// Read when called: an upload finishes long after the render that started it.
	const current = () => referenceUrls(editor.children);
	return {
		urls: useSlateSelector((editor) => referenceUrls(editor.children), shallow),
		add: (added) => setReferenceImages(editor, [...current(), ...added]),
		remove: (index) =>
			setReferenceImages(editor, current().toSpliced(index, 1)),
	};
}
