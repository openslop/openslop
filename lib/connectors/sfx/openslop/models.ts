export const SFX_MODELS = { "Slop SFX v1": "eleven_text_to_sound_v2" } as const;
export type SFXModelId = (typeof SFX_MODELS)[keyof typeof SFX_MODELS];
