import { useCallback } from "react";
import { useProject } from "@/lib/project/useProject";
import type { CaptionStyle } from "./captionStyle";
import { useVideoSetting } from "./useVideoSetting";

/**
 * The project's caption style plus a patcher. Patches are written as a whole
 * style so the persisted value is always complete, never a partial left behind
 * by a deep merge.
 */
export function useCaptionStyle(): [
	CaptionStyle,
	(patch: Partial<CaptionStyle>) => void,
] {
	const style = useVideoSetting("captionStyle");
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
