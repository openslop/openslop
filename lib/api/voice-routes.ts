import omit from "lodash/omit";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ModelRef } from "@/lib/connectors/types";
import { voiceSearchParamsSchema } from "@/lib/project/types";
import { voicePreview } from "@/lib/providers/tts/voicePreview";
import { requiredVoiceId } from "./request-schema-fields";
import type { RouteFamily } from "./route-families";

export const createVoiceSearchHandler = <TModels, TPicked extends ModelRef>(
	family: RouteFamily<TModels, TPicked>,
	models: TModels,
) =>
	family.createQueryHandler({
		schema: voiceSearchParamsSchema.and(family.model(models)),
		label: "Voice search",
		handle: async ({ user, input }) => {
			const tts = await family.providerFor(user.id, "tts", input);
			const voices = await tts.search(omit(input, "provider", "model"));
			return NextResponse.json({ voices });
		},
	});

const previewParamsSchema = z.object({ voiceId: requiredVoiceId });

/**
 * A preview is fetched from our blob storage if available, otherwise live
 * from the TTS provider and uploaded to blob storage.
 */
export const createVoicePreviewHandler = <TModels, TPicked extends ModelRef>(
	family: RouteFamily<TModels, TPicked>,
	models: TModels,
) =>
	family.createQueryHandler({
		schema: previewParamsSchema.and(family.model(models)),
		label: "Voice preview",
		handle: async ({ user, input }) => {
			const tts = await family.providerFor(user.id, "tts", input);
			return NextResponse.json(
				{ preview: await voicePreview(tts, input.voiceId) },
				{ headers: { "Cache-Control": "private, max-age=3600" } },
			);
		},
	});
