/**
 * TTS attribute enums
 * These enums are used for text-to-speech (TTS) generation
 */
export const TTS_GENDERS = ["masculine", "feminine"] as const;
export type TTSGender = (typeof TTS_GENDERS)[number];

export const TTS_AGES = ["child", "adult"] as const;
export type TTSAge = (typeof TTS_AGES)[number];

export const TTS_PITCHES = ["high", "medium", "low"] as const;
export type TTSPitch = (typeof TTS_PITCHES)[number];

export const TTS_SPEEDS = ["slow", "medium", "fast"] as const;
export type TTSSpeed = (typeof TTS_SPEEDS)[number];

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

export enum TTSEmotion {
	Happy = "happy",
	Excited = "excited",
	Enthusiastic = "enthusiastic",
	Elated = "elated",
	Euphoric = "euphoric",
	Triumphant = "triumphant",
	Amazed = "amazed",
	Surprised = "surprised",
	Flirtatious = "flirtatious",
	Curious = "curious",
	Content = "content",
	Peaceful = "peaceful",
	Serene = "serene",
	Calm = "calm",
	Grateful = "grateful",
	Affectionate = "affectionate",
	Trust = "trust",
	Sympathetic = "sympathetic",
	Anticipation = "anticipation",
	Mysterious = "mysterious",
	Angry = "angry",
	Mad = "mad",
	Outraged = "outraged",
	Frustrated = "frustrated",
	Agitated = "agitated",
	Threatened = "threatened",
	Disgusted = "disgusted",
	Contempt = "contempt",
	Envious = "envious",
	Sarcastic = "sarcastic",
	Ironic = "ironic",
	Sad = "sad",
	Dejected = "dejected",
	Melancholic = "melancholic",
	Disappointed = "disappointed",
	Hurt = "hurt",
	Guilty = "guilty",
	Bored = "bored",
	Tired = "tired",
	Rejected = "rejected",
	Nostalgic = "nostalgic",
	Wistful = "wistful",
	Apologetic = "apologetic",
	Hesitant = "hesitant",
	Insecure = "insecure",
	Confused = "confused",
	Resigned = "resigned",
	Anxious = "anxious",
	Panicked = "panicked",
	Alarmed = "alarmed",
	Scared = "scared",
	Neutral = "neutral",
	Proud = "proud",
	Confident = "confident",
	Distant = "distant",
	Skeptical = "skeptical",
	Contemplative = "contemplative",
	Determined = "determined",
}

export const TTS_EMOTIONS = Object.values(TTSEmotion) as TTSEmotion[];
