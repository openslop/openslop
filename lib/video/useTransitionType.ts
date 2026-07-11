import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore, useProjectStore } from "@/lib/project/store";
import { DEFAULT_TRANSITION, type TransitionType } from "./transitions";

export function useTransitionType(): TransitionType {
	const { projectId } = useConfig();
	return useProjectStore(
		projectId,
		(s) => s.metadata.videoSettings?.transitionType ?? DEFAULT_TRANSITION,
	);
}

export function setTransitionType(
	projectId: string,
	transitionType: TransitionType,
) {
	getProjectStore(projectId)
		.getState()
		.updateMetadata({ videoSettings: { transitionType } });
}
