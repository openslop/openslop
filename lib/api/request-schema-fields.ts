import { z } from "zod";
import { BYOK_PROVIDERS } from "@/lib/connectors/providerCatalog";
import { VIDEO_RESOLUTIONS } from "@/lib/video/aspectRatio";
import { parseImageSource } from "./imageSource";

export const byokProviderField = z.enum(BYOK_PROVIDERS);

const optionalCoercedNumber = z
	.union([z.number(), z.string()])
	.transform((v) =>
		typeof v === "string" && v.trim() === "" ? NaN : Number(v),
	)
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

export const optionalVideoResolution = {
	resolution: z.enum(VIDEO_RESOLUTIONS).optional(),
} as const;

export const referenceImageUrlOrDataUri = z
	.string()
	.refine((value) => parseImageSource(value) !== null, {
		message: "Each referenceImages entry must be a data URI or an HTTP(S) URL",
	});

export const optionalReferenceImages = {
	referenceImages: z.array(referenceImageUrlOrDataUri).optional(),
} as const;

export const optionalFrameImages = {
	frameImages: z.array(referenceImageUrlOrDataUri).optional(),
} as const;

export const imageFile = (maxBytes: number) =>
	z
		.instanceof(File, { error: "No file provided" })
		.refine((file) => file.type.startsWith("image/"), {
			message: "File must be an image",
		})
		.refine((file) => file.size <= maxBytes, {
			message: `File must be under ${maxBytes / 1024 / 1024} MB`,
		});

export const requiredVoiceId = z
	.string({ error: "voiceId is required" })
	.min(1, {
		message: "voiceId is required",
	});
