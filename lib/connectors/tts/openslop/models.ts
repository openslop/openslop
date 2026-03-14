export const TTS_MODELS = { "Slop TTS v1": "sonic-3" } as const;
export type TTSModelId = (typeof TTS_MODELS)[keyof typeof TTS_MODELS];
