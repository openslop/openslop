import { z } from "zod";
import { MODEL_CATALOGS } from "@/lib/connectors/models";
import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type { ConnectorType } from "@/lib/connectors/types";
import { THINKING_LEVELS } from "@/lib/connectors/llm/enums";
import { TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import {
	optionalDurationSeconds,
	optionalFrameImages,
	optionalImageDimensions,
	optionalReferenceImages,
	optionalVideoDuration,
	requiredVoiceId,
} from "./request-schema-fields";

/**
 * A model this route serves, kept by name. The name is what says which provider
 * serves it, so it stays a name until the moment a vendor is actually called;
 * translating it to the vendor's id any earlier throws that away.
 */
const modelName = (names: string[]) =>
	z.string().refine((name) => names.includes(name), {
		message: `Invalid model. Supported: ${names.join(", ")}`,
	});

/** Which keys a route generates on, and so which half of a catalog it serves. */
export type ModelScope = "hosted" | "byok";

const modelNames = (type: ConnectorType, scope: ModelScope) => {
	const catalog = MODEL_CATALOGS[type];
	const hosted = scope === "hosted";
	return catalog.names.filter(
		(name) => (catalog.providerFor(name) === MANAGED_PROVIDER) === hosted,
	);
};

/**
 * The models one route family serves. Both halves come from the same catalog,
 * so a model wired in is offered by exactly the family that can pay for it.
 * Hosted routes may leave it out and take the catalog's default; a BYOK one
 * cannot, since the name is what says whose key to read.
 */
export const modelField = (type: ConnectorType, scope: ModelScope) =>
	scope === "hosted"
		? modelName(modelNames(type, "hosted")).optional()
		: modelName(modelNames(type, "byok"));

/**
 * A generation request: the prompt every provider takes, the model that decides
 * which one serves it, and whatever else that connector type accepts.
 */
function generationBody<TModel extends z.ZodType, TShape extends z.ZodRawShape>(
	model: TModel,
	shape: TShape,
) {
	return z.object(
		{
			prompt: z.string({ error: "prompt is required" }).min(1, {
				message: "prompt is required",
			}),
			model,
			projectId: z.uuid().optional(),
			...shape,
		},
		"Request body must be a JSON object",
	);
}

/**
 * A generation as one route family takes it. The model's name is kept rather
 * than transformed into the provider's id: the name is what says which provider
 * serves it, and so whose key to read.
 */
export const bodySchema = <TShape extends z.ZodRawShape>(
	type: ConnectorType,
	scope: ModelScope,
	shape: TShape,
) => generationBody(modelField(type, scope), shape);

/**
 * What each connector type accepts beyond the prompt and the model. Shared by
 * the hosted and BYOK routes, which differ in who they bill, not in what a
 * generation of that type takes.
 */
export const IMAGE_FIELDS = {
	format: z.string().optional(),
	...optionalImageDimensions,
	...optionalReferenceImages,
} as const;

export const VIDEO_FIELDS = {
	...optionalReferenceImages,
	...optionalFrameImages,
	...optionalVideoDuration,
	...optionalImageDimensions,
} as const;

export const TTS_FIELDS = {
	voiceId: requiredVoiceId,
	speed: z.enum(TTS_SPEEDS).optional(),
	volume: z.number().optional(),
	emotion: z.string().optional(),
	format: z.string().optional(),
} as const;

export const AUDIO_FIELDS = optionalDurationSeconds;

export const LLM_FIELDS = {
	systemPrompt: z.string().optional(),
	thinkingLevel: z.enum(THINKING_LEVELS).optional(),
	maxTokens: z.number().optional(),
	temperature: z.number().optional(),
	...optionalReferenceImages,
	stream: z.boolean().optional(),
} as const;
