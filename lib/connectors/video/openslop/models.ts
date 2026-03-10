export const VIDEO_MODELS = ["bytedance:2@2"] as const;
export type VideoModelId = (typeof VIDEO_MODELS)[number];
