import type { Metadata } from "@/lib/project/types";
import type { CanvasContentElement, CanvasElementType } from "../types";
import { characterAvatarsContributor } from "./contributors/characterAvatars";
import { characterVoiceIdContributor } from "./contributors/characterVoiceId";

export type AttributeContributor = {
	name: string;
	appliesTo?: CanvasElementType[];
	derive: (
		element: CanvasContentElement,
		metadata: Metadata,
	) => Record<string, string | undefined>;
};

export const INPUT_CONTRIBUTORS: AttributeContributor[] = [
	characterAvatarsContributor,
	characterVoiceIdContributor,
];
