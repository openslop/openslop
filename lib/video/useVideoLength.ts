import { useProject } from "@/lib/project/useProject";
import { resolveVideoLength, type VideoLength } from "./videoLength";

export function useVideoLength(): VideoLength {
	return useProject((s) => resolveVideoLength(s.metadata));
}
