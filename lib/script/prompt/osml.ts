import { dedent } from "@/lib/dedent";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	LOOPS_OPTIONS,
	TOGGLE_ON,
} from "@/lib/canvas/types";
import {
	DEFAULT_MOTION,
	MOTION_EFFECTS,
} from "@/lib/render/motion-effect-names";
import { loopDef } from "@/lib/connectors/attributes/common";
import { lyricsDef } from "@/lib/connectors/music/attributes";
import {
	CONTINUITY_ATTR,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import { VIDEO_FORMAT_RULES } from "./formats";
import { TTS_EMOTIONS, TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import { languagePrompt } from "./language";
import { CHARACTER_REFS_RULE } from "./character-refs";
import { VIDEO_PROMPT_FORMAT } from "./video-prompt";
import { MUSIC_PROMPT_FORMAT } from "./music-prompt";

/** Only the writer replies in XML; a review reads the same spec and replies in findings. */
export const OSML_REPLY_FORMAT =
	"Reply with the raw XML only: no code fences and no text around it. Your reply starts with < and ends with >.";

export function osmlSpec(language: string): string {
	return dedent`
		The story script must be written in the XML format below. Never nest tags.

		## Format
		${VIDEO_FORMAT_RULES}

		${languagePrompt(language)}

		## Order
		Write the story and nothing else, using only the elements your format allows.

		## <speech>
		- What one character says out loud. name is required: the character who says it. A narrator, for example, is a character with no appearance. Example: <speech name="Lyra" emotion="excited">Truce?</speech>
		- emotion: ${TTS_EMOTIONS.join(", ")}. speed: ${TTS_SPEEDS.join(", ")}.
		- Never write words in ALL CAPS, because the voice engine mispronounces them. Acronyms like USA stay capitalized.
		- The only nonverbal cue is [laughter]. Use ... for a pause and ! for strong feeling. Example: <speech name="Mia" emotion="happy">[laughter] That's the way I want it!</speech>
		- Nobody sees the prompts, so let the speech mention some of what the pictures show.

		## <image>
		- The body is an image prompt: the time of day, the background, the weather if outdoors, and the objects, in detail.
		- Depict the specific moment described by the speech that follows it, up to the next visual: who is there, what they do and their expressions, not just the setting.
		- Each <image> prompt must stand alone. The image model knows nothing about the story or the other prompts, so repeat any detail it needs.
		- ${CHARACTER_REFS_RULE}
		- motion: a camera move for the whole time the image is on screen. Set one on almost every image. Allowed values: ${MOTION_EFFECTS.join(", ")}.
		- Example: <image motion="kenBurnsIn">{{Red}} hands a basket to {{Granny}} at the door of a thatched cottage on a rainy afternoon.</image>

		## <video>
		- A short generated video whose sound is written into its shots. The body is a video prompt, written as the Video prompts section says.
		- duration: how many seconds to generate (default ${DEFAULT_DURATION}). Allowed values: see Model attributes.
		- ${START_FRAME_ATTR}, ${CONTINUITY_ATTR} and ${loopDef.key}: see Format.
		- motion: normally set to "${DEFAULT_MOTION}". Only set one when the shots have no camera move of their own.
		- Example: <video startFrame="none">Shot 1: Wide shot of a moonlit forest clearing as {{Red}} and {{Wolf}} walk in from the trees, rain falling through the branches. Sound: rain pattering on leaves, a stream nearby.</video>

		${VIDEO_PROMPT_FORMAT}

		## <sound>
		- A sound effect that no <video> already makes. The body is a short, plain sound prompt, like rain, wind, a fire crackling or footsteps.
		- Place it right before the line it belongs to.
		- loops: how many times it plays back to back (default ${DEFAULT_LOOPS}). Allowed values: ${LOOPS_OPTIONS.join(", ")}. Use more for a sound that fills a scene, like rain or wind, and 1 for a single moment, like a door. Example:
		  <sound loops="4">Wind</sound>
		  <speech name="Narrator" emotion="peaceful">They walked through the windy forest.</speech>
		- Never a voice: no sighs, gasps, laughter or crying.

		## <music>
		- A music cue for the scenes from here to the next <music>. The body is a music prompt, written as the Music prompts section says.
		- Place it right before the first element it plays under.
		- loops: how many times it plays back to back (default ${DEFAULT_LOOPS}). Allowed values: ${LOOPS_OPTIONS.join(", ")}. A cue written to its runtime plays once; use more only for a short bed that should repeat.
		- ${lyricsDef.key}: "${TOGGLE_ON}" makes the cue a song, sung over the scenes (default "${lyricsDef.default}", instrumental). Set it only when the story calls for a song, like a music video, a theme song or a character singing, and never under speech, where the singing would fight the voice.

		${MUSIC_PROMPT_FORMAT}
	`;
}
