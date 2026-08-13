import { useProject } from "@/lib/project/useProject";
import type { VideoSettings } from "./videoSettings";

/** One knob from the project's video settings; always set, never a fallback. */
export function useVideoSetting<K extends keyof VideoSettings>(
	key: K,
): VideoSettings[K] {
	return useProject((s) => s.metadata.videoSettings[key]);
}
