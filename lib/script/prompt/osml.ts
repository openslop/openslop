import dedent from "dedent";
import { DEFAULT_DURATION, DURATION_OPTIONS } from "@/lib/canvas/types";
import { MOTION_EFFECTS } from "@/lib/render/motionEffectNames";
import { VIDEO_SHAPES } from "./shapes";
import { EffectType } from "@/lib/connectors/image/enums";
import { MusicLength } from "@/lib/connectors/music/enums";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_EMOTIONS,
	TTS_LANGUAGES,
	TTS_PITCHES,
	TTS_SPEEDS,
} from "@/lib/connectors/tts/enums";
import { languagePrompt } from "./language";
import { VIDEO_PROMPT_FORMAT } from "./videoPrompt";

export function osmlSpec(language: string): string {
	return dedent`
  The story script must be written in OSML, the XML format below. Reply with the raw XML only: no code fences and no text around it. Your reply starts with < and ends with >. Never put a tag inside another tag.

${VIDEO_SHAPES}

${languagePrompt(language)}

  ## Order
  1. <metadata_title>, then <metadata_style>, then <metadata_narration>, then one <metadata_character> per character.
  2. The story, using only the elements your shape allows. Start with a visual, and change the visual at least every two spoken lines.

  ## Metadata tags
  - <metadata_title>: a short title of 1 to 4 words. Example: <metadata_title>Little Red</metadata_title>
  - <metadata_style>: how everything is drawn: the medium, linework, colors and lighting. Never a place, a setting, a subject or a time of day. Example: <metadata_style>Warm earth tones. Whimsical storybook illustration with soft watercolors and warm lighting.</metadata_style>
  - <metadata_narration>: an empty tag for the narrator's voice. Example: <metadata_narration gender="masculine" age="adult" pitch="low" accent="british" description="wise" language="en"></metadata_narration>
  - <metadata_character>: one per character, not the narrator. The body says what they look like, written like an image prompt. name is their exact name in the story. Example:
    <metadata_character name="Mia" gender="feminine" age="child" pitch="high" accent="american" description="curious" language="en">A girl around ten years old with warm brown skin, dark curly hair just past her shoulders, bright hazel eyes and a small gap between her front teeth. She wears a mustard-yellow cardigan, rolled-up denim overalls and scuffed red sneakers.</metadata_character>
  - Both voice tags take these attributes:
    - gender: ${TTS_GENDERS.join(", ")}.
    - age: ${TTS_AGES.join(", ")}.
    - pitch: ${TTS_PITCHES.join(", ")}.
    - accent: ${TTS_ACCENTS.join(", ")}.
    - description: a word or two for the voice, like Warm, Deep, Upbeat or Soft.
    - language: ISO 639-1 code of the language the narration and dialogue are written in. Allowed values: ${TTS_LANGUAGES.join(", ")}.

  ## Speech
  - <narration>: what the narrator says. Example: <narration emotion="neutral">The sun was setting in the west.</narration>
  - <character>: what one character says out loud. name is required. Example: <character name="Lyra" emotion="excited">Truce?</character>
  - Keep dialogue dead simple: everyday words, short sentences, one clear thought per line. Every line must make sense for who says it and what just happened.
  - Both take emotion (${TTS_EMOTIONS.join(", ")}) and speed (${TTS_SPEEDS.join(", ")}).
  - Never write words in ALL CAPS, because the voice engine mispronounces them. Acronyms like USA stay capitalized.
  - The only nonverbal cue is [laughter]. Use ... for a pause and ! for strong feeling. Example: <character name="Mia" emotion="happy">[laughter] That's the way I want it!</character>
  - Nobody sees the prompts, so let the narration mention some of what the pictures show.

  ## <image>
  - The body is an image prompt: the time of day, the background, the weather if outdoors, and the objects, in detail.
  - Depict the specific moment described by the narration and dialogue that follow it, up to the next visual: who is there, what they do and how they look, not just the setting.
  - Each <image> prompt must stand alone. The image model knows nothing about the story or the other prompts, so repeat any detail it needs.
  - Reference characters by their names in the image prompt, and list them in characters. Never describe their appearance.
  - characters: the exact names of the characters in the picture, comma-separated.
  - motion: a camera move for the whole time the image is on screen. Set one on almost every image, at most one per scene. Allowed values: ${MOTION_EFFECTS.join(", ")}.
  - overlays: effects that match the picture, comma-separated. Allowed values: ${Object.values(EffectType).join(", ")}.
  - Example: <image characters="Red,Granny" motion="kenBurnsIn" overlays="rain">Red hands a basket to Granny at the door of a thatched cottage on a rainy afternoon.</image>

  ## <video>
  - A short generated video that makes its own sound. The body is a video prompt, written as the Video prompts section says.
  - duration: how many seconds to generate (default ${DEFAULT_DURATION}). Allowed values: ${DURATION_OPTIONS.join(", ")}.
  - startFrame, trimToDialogue and loop: see Shape.
  - characters and overlays: as for <image>. Every shot follows the <image> prompt rules.
  - motion: normally set to "none". Only set one when the shots have no camera move of their own.
  - Example: <video characters="Red,Wolf" overlays="rain" trimToDialogue="false">Shot 1: Wide shot of a moonlit forest clearing as Red and Wolf walk in from the trees, rain falling through the branches. Sound: rain pattering on leaves, a stream nearby. Shot 2: The camera slowly rises to show the whole clearing.</video>

${VIDEO_PROMPT_FORMAT}

  ## <sound>
  - A sound effect that no <video> already makes. The body is a short, plain sound prompt, like rain, wind, a fire crackling or footsteps.
  - Place it right before the line it belongs to.
  - loops: how many times it plays back to back (default 1). Use more for a sound that fills a scene, like rain or wind, and 1 for a single moment, like a door. Example:
    <sound loops="4">Wind</sound>
    <narration emotion="peaceful">They walked through the windy forest.</narration>
  - Never a voice: no sighs, gasps, laughter or crying.

  ## <music>
  - Music for the mood of part of the story. The body is a short, plain music prompt. Example: <music length="long">Soft, slow, sad piano for a breakup</music>
  - Change the music every few scenes.
  - length: ${Object.values(MusicLength).join(", ")}.
  - loops: how many times it plays back to back (default 1). Use more for music that should fill several scenes.
`;
}
