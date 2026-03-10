export const MUSIC_MODELS = ["music_v1"] as const;
export type MusicModelId = (typeof MUSIC_MODELS)[number];
