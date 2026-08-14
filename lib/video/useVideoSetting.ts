import { useCallback } from "react";
import { useProject } from "@/lib/project/useProject";
import type { VideoSettings } from "./videoSettings";

/** One knob from the project's video settings; always set, never a fallback. */
export function useVideoSetting<K extends keyof VideoSettings>(
	key: K,
): VideoSettings[K] {
	return useProject((s) => s.metadata.videoSettings[key]);
}

/** Writes the knobs `useVideoSetting` reads: the only way the UI changes them. */
export function useUpdateVideoSettings(): (
	patch: Partial<VideoSettings>,
) => void {
	const updateMetadata = useProject((s) => s.updateMetadata);
	return useCallback(
		(patch) => updateMetadata({ videoSettings: patch }),
		[updateMetadata],
	);
}
