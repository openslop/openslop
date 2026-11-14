export const TTS_GENDERS = ["masculine", "feminine"] as const;
export type TTSGender = (typeof TTS_GENDERS)[number];

export const TTS_AGES = ["child", "adult"] as const;
export type TTSAge = (typeof TTS_AGES)[number];

export const TTS_PITCHES = ["high", "medium", "low"] as const;
export type TTSPitch = (typeof TTS_PITCHES)[number];

export const TTS_SPEEDS = ["slow", "medium", "fast"] as const;
export type TTSSpeed = (typeof TTS_SPEEDS)[number];
export const DEFAULT_TTS_SPEED: TTSSpeed = "medium";

export const TTS_LANGUAGES = [
	"en",
	"fr",
	"de",
	"es",
	"pt",
	"zh",
	"ja",
	"hi",
	"it",
	"ko",
	"nl",
	"pl",
	"ru",
	"sv",
	"tr",
	"tl",
	"bg",
	"ro",
	"ar",
	"cs",
	"el",
	"fi",
	"hr",
	"ms",
	"sk",
	"da",
	"ta",
	"uk",
	"hu",
	"no",
	"vi",
	"bn",
	"th",
	"he",
	"ka",
	"id",
	"te",
	"gu",
	"kn",
	"ml",
	"mr",
	"pa",
] as const;
export type TTSLanguage = (typeof TTS_LANGUAGES)[number];
export const DEFAULT_TTS_LANGUAGE: TTSLanguage = "en";

export const TTS_ACCENTS = [
	"american",
	"british",
	"african-american",
	"southern",
	"australian",
	"indian",
	"french",
	"german",
	"spanish",
	"japanese",
] as const;
export type TTSAccent = (typeof TTS_ACCENTS)[number];

export const TTS_EMOTIONS = [
	"happy",
	"excited",
	"enthusiastic",
	"elated",
	"euphoric",
	"triumphant",
	"amazed",
	"surprised",
	"flirtatious",
	"curious",
	"content",
	"peaceful",
	"serene",
	"calm",
	"grateful",
	"affectionate",
	"trust",
	"sympathetic",
	"anticipation",
	"mysterious",
	"angry",
	"mad",
	"outraged",
	"frustrated",
	"agitated",
	"threatened",
	"disgusted",
	"contempt",
	"envious",
	"sarcastic",
	"ironic",
	"sad",
	"dejected",
	"melancholic",
	"disappointed",
	"hurt",
	"guilty",
	"bored",
	"tired",
	"rejected",
	"nostalgic",
	"wistful",
	"apologetic",
	"hesitant",
	"insecure",
	"confused",
	"resigned",
	"anxious",
	"panicked",
	"alarmed",
	"scared",
	"neutral",
	"proud",
	"confident",
	"distant",
	"skeptical",
	"contemplative",
	"determined",
] as const;
export type TTSEmotion = (typeof TTS_EMOTIONS)[number];

export const DEFAULT_TTS_EMOTION: TTSEmotion = "neutral";
