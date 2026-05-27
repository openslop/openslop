import type { Metadata } from "@/lib/project/types";
import type { CanvasElementType } from "../../types";
import type { AttributeContributor } from "../inputContributors";

const APPLIES_TO: CanvasElementType[] = ["narration"];

export const narratorVoiceIdContributor: AttributeContributor = {
	name: "narratorVoiceId",
	appliesTo: APPLIES_TO,
	derive: (_element, metadata: Metadata) => ({
		voiceId: metadata.narration.voiceId,
	}),
};
