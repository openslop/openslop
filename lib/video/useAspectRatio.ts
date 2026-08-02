import { useProject } from "@/lib/project/useProject";
import { resolveAspectRatio, type AspectRatio } from "./aspectRatio";

export function useAspectRatio(): AspectRatio {
	return useProject((s) => resolveAspectRatio(s.metadata));
}
