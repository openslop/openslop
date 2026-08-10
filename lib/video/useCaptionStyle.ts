import { useCallback } from "react";
import { useProject } from "@/lib/project/useProject";
import { resolveCaptionStyle, type CaptionStyle } from "./captionStyle";

/**
 * The project's caption style plus a patcher. Patches are written as a whole
 * style so the persisted value is always complete, never a partial left behind
 * by a deep merge.
 */
export function useCaptionStyle(): [
	CaptionStyle,
	(patch: Partial<CaptionStyle>) => void,
] {
	const style = useProject((s) => resolveCaptionStyle(s.metadata));
	const updateMetadata = useProject((s) => s.updateMetadata);

	const setStyle = useCallback(
		(patch: Partial<CaptionStyle>) =>
			updateMetadata({
				videoSettings: { captionStyle: { ...style, ...patch } },
			}),
		[style, updateMetadata],
	);

	return [style, setStyle];
}
