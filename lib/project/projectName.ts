import { getProjectStore } from "./store";
import type { Metadata } from "./types";

export function deriveProjectName(metadata: Metadata | undefined): string {
	const title = metadata?.title?.trim();
	return title && title.length > 0 ? title : "Untitled";
}

export function setProjectTitle(projectId: string, title: string) {
	getProjectStore(projectId).getState().updateMetadata({ title });
}
