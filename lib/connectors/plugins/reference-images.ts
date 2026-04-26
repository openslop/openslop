import type { ConnectorPlugin } from "../types";
import { getProjectStore } from "@/lib/project/store";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
};

export function createReferenceImagesPlugin(
	projectId: string,
): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		beforeGenerate(params) {
			const { referenceImages: existing = [], ...rest } = params;
			const storeImages = getProjectStore(projectId).getState().referenceImages;
			if (storeImages.length === 0 && existing.length === 0) return params;
			return {
				...rest,
				referenceImages: [...existing, ...storeImages],
			};
		},
	};
}
