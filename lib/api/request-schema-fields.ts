import { z } from "zod";

export const optionalImageDimensions = {
	width: z.number().optional(),
	height: z.number().optional(),
} as const;

export const optionalDurationSeconds = {
	durationSeconds: z.number().optional(),
} as const;

export const optionalVideoDuration = {
	duration: z.number().optional(),
} as const;

export const referenceImageUrlOrDataUri = z
	.string()
	.refine(
		(value) =>
			/^data:[a-z]+\/[a-z+.-]+;base64,/i.test(value) ||
			/^https?:\/\//i.test(value),
		{
			message:
				"Each referenceImages entry must be a data URI or an HTTP(S) URL",
		},
	);

export const optionalReferenceImages = {
	referenceImages: z.array(referenceImageUrlOrDataUri).optional(),
} as const;

export const requiredVoiceId = z
	.string({ error: "voiceId is required" })
	.min(1, {
		message: "voiceId is required",
	});
