export const IMAGE_FORMATS = ["jpg", "png", "webp"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

/** Every video model takes a JPEG frame; WebP is smaller but not all of them read it. */
export const DEFAULT_IMAGE_FORMAT: ImageFormat = "jpg";

export const IMAGE_MIME_TYPES: Record<ImageFormat, string> = {
	jpg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
};

export const EFFECT_TYPES = ["smoke", "rain", "orbs", "lightning"] as const;
export type EffectType = (typeof EFFECT_TYPES)[number];
