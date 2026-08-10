import { useProject } from "@/lib/project/useProject";
import { resolveCaptionsEnabled } from "./captions";

export function useCaptionsEnabled(): boolean {
	return useProject((s) => resolveCaptionsEnabled(s.metadata));
}
