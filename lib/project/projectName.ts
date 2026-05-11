import type { Metadata } from "./types";

export function deriveProjectName(metadata: Metadata | undefined): string {
	const title = metadata?.title?.trim();
	return title && title.length > 0 ? title : "Untitled";
}
