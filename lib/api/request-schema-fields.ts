import { z } from "zod";

const optionalCoercedNumber = z
	.union([z.number(), z.string()])
	.transform((v) => (typeof v === "string" ? Number(v) : v))
	.refine((v) => Number.isFinite(v), { message: "must be a finite number" })
	.optional();

export const optionalImageDimensions = {
	width: optionalCoercedNumber,
	height: optionalCoercedNumber,
} as const;

export const optionalDurationSeconds = {
	durationSeconds: z.number().optional(),
} as const;

export const optionalVideoDuration = {
	duration: optionalCoercedNumber,
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
