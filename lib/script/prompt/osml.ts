import { dedent } from "@/lib/dedent";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	DURATION_OPTIONS,
	LOOPS_OPTIONS,
} from "@/lib/canvas/types";
import { MOTION_EFFECTS } from "@/lib/render/motion-effect-names";
import { VIDEO_FORMATS } from "./formats";
import { EffectType } from "@/lib/connectors/image/enums";
import { MusicLength } from "@/lib/connectors/music/enums";
import { TTS_EMOTIONS, TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import { languagePrompt } from "./language";
import { VIDEO_PROMPT_FORMAT } from "./video-prompt";

export function osmlSpec(language: string): string {
	return dedent`
		The story script must be written in the XML format below. Reply with the raw XML only: no code fences and no text around it. Your reply starts with < and ends with >. Never nest tags.

		## Format
		${VIDEO_FORMATS}

		${languagePrompt(language)}

		## Order
		Write the story and nothing else, using only the elements your format allows. There must be a new visual (image or video) at least once before every sentence in a character or narration element.

		## Speech
		- <narration>: what the narrator says. Example: <narration emotion="neutral">The sun was setting in the west.</narration>
		- <character>: what one character says out loud. name is required and must be a character listed under Characters; with none listed, the narrator tells the whole story. Example: <character name="Lyra" emotion="excited">Truce?</character>
		- Keep dialogue dead simple: everyday words and short sentences. Every line must make complete sense to the listener.
		- Both take emotion (${TTS_EMOTIONS.join(", ")}) and speed (${TTS_SPEEDS.join(", ")}).
		- Never write words in ALL CAPS, because the voice engine mispronounces them. Acronyms like USA stay capitalized.
		- The only nonverbal cue is [laughter]. Use ... for a pause and ! for strong feeling. Example: <character name="Mia" emotion="happy">[laughter] That's the way I want it!</character>
		- Nobody sees the prompts, so let the narration mention some of what the pictures show.

		## <image>
		- The body is an image prompt: the time of day, the background, the weather if outdoors, and the objects, in detail.
		- Depict the specific moment described by the narration and dialogue that follow it, up to the next visual: who is there, what they do and their expressions, not just the setting.
		- Each <image> prompt must stand alone. The image model knows nothing about the story or the other prompts, so repeat any detail it needs.
		- Reference characters by their names in the image prompt, and list them in characters. Never describe their appearance.
		- characters: the exact names of the characters in the picture, comma-separated.
		- motion: a camera move for the whole time the image is on screen. Set one on almost every image. Allowed values: ${MOTION_EFFECTS.join(", ")}.
		- overlays: effects that match the picture, comma-separated. Allowed values: ${Object.values(EffectType).join(", ")}.
		- Example: <image characters="Red,Granny" motion="kenBurnsIn" overlays="rain">Red hands a basket to Granny at the door of a thatched cottage on a rainy afternoon.</image>

		## <video>
		- A short generated video whose sound is written into its shots. The body is a video prompt, written as the Video prompts section says.
		- duration: how many seconds to generate (default ${DEFAULT_DURATION}). Allowed values: ${DURATION_OPTIONS.join(", ")}.
		- startFrame, continuity, trimToDialogue and loop: see Format.
		- characters and overlays: as for <image>. Name characters in shots as for <image>.
		- motion: normally set to "none". Only set one when the shots have no camera move of their own.
		- Example: <video characters="Red,Wolf" overlays="rain" startFrame="none" trimToDialogue="false">Shot 1: Wide shot of a moonlit forest clearing as Red and Wolf walk in from the trees, rain falling through the branches. Sound: rain pattering on leaves, a stream nearby.</video>

		${VIDEO_PROMPT_FORMAT}

		## <sound>
		- A sound effect that no <video> already makes. The body is a short, plain sound prompt, like rain, wind, a fire crackling or footsteps.
		- Place it right before the line it belongs to.
		- loops: how many times it plays back to back (default ${DEFAULT_LOOPS}). Allowed values: ${LOOPS_OPTIONS.join(", ")}. Use more for a sound that fills a scene, like rain or wind, and 1 for a single moment, like a door. Example:
		  <sound loops="4">Wind</sound>
		  <narration emotion="peaceful">They walked through the windy forest.</narration>
		- Never a voice: no sighs, gasps, laughter or crying.

		## <music>
		- Music for the mood of part of the story. The body is a short, plain music prompt. Example: <music length="long">Soft, slow, sad piano for a breakup</music>
		- Change the music every few scenes.
		- length: ${Object.values(MusicLength).join(", ")}.
		- loops: how many times it plays back to back (default ${DEFAULT_LOOPS}). Allowed values: ${LOOPS_OPTIONS.join(", ")}. Use more for music that should fill several scenes.
	`;
}
