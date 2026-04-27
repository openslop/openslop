import type { ConnectorPlugin } from "../types";
import { getProjectStore } from "@/lib/project/store";

export function createArtStylePlugin(
	projectId: string,
): ConnectorPlugin<{ prompt: string }> {
	return {
		name: "art-style",
		transformPrompt(prompt) {
			const style = getProjectStore(projectId)
				.getState()
				.metadata.style?.trim();
			if (!style) return prompt;
			return `${style}. ${prompt}`;
		},
	};
}
