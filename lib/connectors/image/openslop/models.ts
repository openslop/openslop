export const IMAGE_MODELS = {
  "Slop Image v1": "runware:z-image@turbo",
} as const;
export type ImageModelId = (typeof IMAGE_MODELS)[keyof typeof IMAGE_MODELS];
