import { useCallback } from "react";
import type { CaptionStyle } from "./caption-style";
import { useProject } from "../project/use-project";
import { useVideoSetting } from "../project/use-video-setting";

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
	const updateVideoSettings = useProject((state) => state.updateVideoSettings);

	const setStyle = useCallback(
		(patch: Partial<CaptionStyle>) =>
			updateVideoSettings({ captionStyle: { ...style, ...patch } }),
		[style, updateVideoSettings],
	);

	return [style, setStyle];
}
