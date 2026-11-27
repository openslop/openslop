import { modelEntry } from "@/lib/connectors/models";
import type { ConnectorType, ModelRef } from "@/lib/connectors/types";
import type { ModelPromptSkillName } from "./registry";

/** Keyed by the vendor's model id, so a model OpenSlop hosts shares its vendor's skill. */
const MODEL_PROMPT_SKILL: Record<string, ModelPromptSkillName> = {
	"sonic-3.6": "cartesia-sonic",
	"klingai:kling-video@o3-standard": "kling-omni",
	"klingai:kling-video@o3-pro": "kling-omni",
	"klingai:kling-video@4.0": "kling-omni",
	"bytedance:seedance@2.0-fast": "seedance",
	"bytedance:seedance@2.5": "seedance",
};

export const promptSkillFor = (
	type: ConnectorType,
	model: ModelRef,
): ModelPromptSkillName | undefined =>
	MODEL_PROMPT_SKILL[modelEntry(type, model).id];
