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

/** The models OpenSlop hosts. Optional: leaving it out takes the default. */
export const hostedModelField = (models: Record<string, string>) =>
	modelName(Object.keys(models)).optional();

/** The models of a type that run on a user's own key, by name. */
export const byokModelNames = (type: ConnectorType): string[] =>
	MODEL_CATALOGS[type].names.filter(
		(name) => MODEL_CATALOGS[type].providerFor(name) !== MANAGED_PROVIDER,
	);

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

/** A generation on the models OpenSlop hosts, named as this API names them. */
export const bodySchema = <TShape extends z.ZodRawShape>(
	models: Record<string, string>,
	shape: TShape,
) => generationBody(hostedModelField(models), shape);

/**
 * A generation on the user's own key. Unlike the hosted routes it keeps the
 * model's name rather than transforming it to the provider's id: the name is
 * what says which provider serves it, and so whose key to read.
 */
export function byokBodySchema<TShape extends z.ZodRawShape>(
	type: ConnectorType,
	shape: TShape,
) {
	return generationBody(modelName(byokModelNames(type)), shape);
}

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
