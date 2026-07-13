import { useProject } from "@/lib/project/useProject";
import { DEFAULT_TRANSITION, type TransitionType } from "./transitions";

export function useTransitionType(): TransitionType {
	return useProject(
		(s) => s.metadata.videoSettings?.transitionType ?? DEFAULT_TRANSITION,
	);
}
