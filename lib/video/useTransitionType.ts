import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
import { DEFAULT_TRANSITION, type TransitionType } from "./transitions";

export function useTransitionType(): TransitionType {
	const { projectId } = useConfig();
	return useProjectStore(
		projectId,
		(s) => s.metadata.videoSettings?.transitionType ?? DEFAULT_TRANSITION,
	);
}
