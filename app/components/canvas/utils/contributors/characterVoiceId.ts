import type { Metadata } from "@/lib/project/types";
import type { CanvasContentElement, CanvasElementType } from "../../types";
import type { AttributeContributor } from "../inputContributors";

const APPLIES_TO: CanvasElementType[] = ["character"];

export const characterVoiceIdContributor: AttributeContributor = {
	name: "characterVoiceId",
	appliesTo: APPLIES_TO,
	derive: (element: CanvasContentElement, metadata: Metadata) => {
		const name = element.customAttributes?.name;
		if (!name) return {};
		return { voiceId: metadata.characters[name]?.voiceId };
	},
};
