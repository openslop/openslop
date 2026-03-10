export const IMAGE_MODELS = ["runware:z-image@turbo"] as const;
export type ImageModelId = (typeof IMAGE_MODELS)[number];
