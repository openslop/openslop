import { z } from "zod";
import { IMAGE_FORMATS } from "@/lib/connectors/image/enums";
import { THINKING_LEVELS } from "@/lib/connectors/llm/enums";
import {
	MANAGED_PROVIDER,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import { TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import type { ModelRef, ModelTable } from "@/lib/connectors/types";
import {
	byokProviderField,
	optionalDurationSeconds,
	optionalFrameImages,
	optionalImageDimensions,
	optionalReferenceImages,
	optionalVideoDuration,
	optionalVideoResolution,
	requiredVoiceId,
} from "./request-schema-fields";

const modelName = (table: ModelTable) => {
	const names = Object.keys(table);
	return z.enum(names, {
		error: `Invalid model. Supported: ${names.join(", ")}`,
	});
};

export const hostedModel = (table: ModelTable) =>
	z.object({
		provider: z.literal(MANAGED_PROVIDER).default(MANAGED_PROVIDER),
		model: modelName(table),
	});

export type BYOKModelRef = ModelRef & { provider: BYOKProvider };

export const byokModel = (
	tables: Partial<Record<BYOKProvider, ModelTable>>,
): z.ZodType<BYOKModelRef> =>
	z
		.object({ provider: byokProviderField, model: z.string() })
		.refine(({ provider, model }) => model in (tables[provider] ?? {}), {
			message: `Invalid model. Supported: ${Object.entries(tables)
				.flatMap(([provider, table]) =>
					Object.keys(table).map((name) => `${provider}/${name}`),
				)
				.join(", ")}`,
		});

export const bodySchema = <
	TModel extends ModelRef,
	TShape extends z.ZodRawShape,
>(
	model: z.ZodType<TModel>,
	shape: TShape,
) =>
	z
		.object(
			{
				prompt: z.string({ error: "prompt is required" }).min(1, {
					message: "prompt is required",
				}),
				projectId: z.uuid().optional(),
				...shape,
			},
			"Request body must be a JSON object",
		)
		.and(model);

export const IMAGE_FIELDS = {
	format: z.enum(IMAGE_FORMATS).optional(),
	...optionalImageDimensions,
	...optionalReferenceImages,
} as const;

export const VIDEO_FIELDS = {
	...optionalReferenceImages,
	...optionalFrameImages,
	...optionalVideoDuration,
	...optionalVideoResolution,
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
