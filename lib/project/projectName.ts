import type { Metadata } from "./types";

export function deriveProjectName(metadata: Metadata): string {
	const title = metadata.title.trim();
	return title.length > 0 ? title : "Untitled";
}
