import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore, useProjectStore } from "@/lib/project/store";
import { type AspectRatio, DEFAULT_ASPECT_RATIO } from "./aspectRatio";

export function useAspectRatio(): AspectRatio {
	const { projectId } = useConfig();
	return useProjectStore(
		projectId,
		(s) => s.metadata.videoSettings?.aspectRatio ?? DEFAULT_ASPECT_RATIO,
	);
}

export function setAspectRatio(projectId: string, aspectRatio: AspectRatio) {
	getProjectStore(projectId)
		.getState()
		.updateMetadata({ videoSettings: { aspectRatio } });
}
