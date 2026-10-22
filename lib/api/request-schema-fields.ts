import { z } from "zod";
import { BYOK_PROVIDERS } from "@/lib/connectors/provider-catalog";
import { HostedVoicePreviewSchema } from "@/lib/connectors/types";
import { MEDIA_RESOLUTIONS } from "@/lib/project/aspect-ratio";
import { parseImageSource } from "./image-source";

export const byokProviderField = z.enum(BYOK_PROVIDERS);

const POSITIVE_NUMBER = "must be a positive number";

const positiveNumber = z
	.number({ error: POSITIVE_NUMBER })
	.positive({ error: POSITIVE_NUMBER });

const optionalPositiveNumber = z
	.union([z.number(), z.string()])
	.transform((value) =>
		typeof value === "string" && value.trim() === "" ? NaN : Number(value),
	)
	.pipe(positiveNumber)
	.optional();

export const optionalImageDimensions = {
	width: optionalPositiveNumber,
	height: optionalPositiveNumber,
} as const;

export const optionalDurationSeconds = {
	durationSeconds: positiveNumber.optional(),
} as const;

export const optionalVideoDuration = {
	duration: optionalPositiveNumber,
} as const;

export const optionalResolution = {
	resolution: z.enum(MEDIA_RESOLUTIONS).optional(),
} as const;

export const referenceImageUrlOrDataUri = z
	.string()
	.refine((value) => parseImageSource(value) !== null, {
		message: "An image must be a data URI or an HTTP(S) URL",
	});

export const optionalReferenceImages = {
	referenceImages: z.array(referenceImageUrlOrDataUri).optional(),
} as const;

export const optionalFrameImage = {
	frameImage: referenceImageUrlOrDataUri.optional(),
} as const;

/** A character in the shot: the avatar it looks like and the voice it speaks in. */
export const CharacterSchema = z.object({
	name: z.string().min(1, { error: "A character must be named" }),
	avatarUrl: referenceImageUrlOrDataUri.optional(),
	voice: HostedVoicePreviewSchema.optional(),
});

export const optionalCharacterAssets = {
	characterAssets: z.array(CharacterSchema).optional(),
} as const;

export const optionalContinuityFrames = {
	continuityFrames: z.array(referenceImageUrlOrDataUri).optional(),
} as const;

export const requiredVoiceId = z
	.string({ error: "voiceId is required" })
	.min(1, { message: "voiceId is required" });
