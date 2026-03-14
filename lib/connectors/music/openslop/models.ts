export const MUSIC_MODELS = { "Slop Music v1": "music_v1" } as const;
export type MusicModelId = (typeof MUSIC_MODELS)[keyof typeof MUSIC_MODELS];
