import { useProject } from "./useProject";
import type { VideoSettings } from "./videoSettings";

export function useVideoSetting<K extends keyof VideoSettings>(
	key: K,
): VideoSettings[K] {
	return useProject((s) => s.videoSettings[key]);
}
