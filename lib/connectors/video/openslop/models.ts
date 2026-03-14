export const VIDEO_MODELS = { "Slop Video v1": "bytedance:2@2" } as const;
export type VideoModelId = (typeof VIDEO_MODELS)[keyof typeof VIDEO_MODELS];
