import { useProject } from "./useProject";
import type { DeepPartial } from "./types";
import type { VideoSettings } from "./videoSettings";

export function useVideoSetting<K extends keyof VideoSettings>(
	key: K,
): VideoSettings[K] {
	return useProject((s) => s.videoSettings[key]);
}

export function useUpdateVideoSettings(): (
	patch: DeepPartial<VideoSettings>,
) => void {
	return useProject((s) => s.updateVideoSettings);
}
