import { useProject } from "./use-project";
import type { VideoSettings } from "./video-settings";

export function useVideoSetting<K extends keyof VideoSettings>(
	key: K,
): VideoSettings[K] {
	return useProject((s) => s.videoSettings[key]);
}
