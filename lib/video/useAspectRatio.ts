import { useProject } from "@/lib/project/useProject";
import { type AspectRatio, DEFAULT_ASPECT_RATIO } from "./aspectRatio";

export function useAspectRatio(): AspectRatio {
	return useProject(
		(s) => s.metadata.videoSettings?.aspectRatio ?? DEFAULT_ASPECT_RATIO,
	);
}
