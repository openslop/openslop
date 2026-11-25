import { dedent } from "@/lib/dedent";
import {
	DEFAULT_DURATION,
	DEFAULT_LOOPS,
	LOOPS_RULE,
	TOGGLE_ON,
} from "@/lib/canvas/types";
import { nameRef } from "@/lib/connectors/name-refs";
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
import { TTS_EMOTIONS, TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import type { Skill } from "./registry";

export const osml = {
	name: "osml",
	description:
		"How to write each script element (speech, image, video, sound, music) in OSML, the XML the canvas holds: attributes, names, and which language each part is in. Load it whenever you write or review element text.",
	content: dedent`
		The script is XML, one tag per element in the order they play. Never nest tags. Write the story and nothing else, using only the elements the format allows (the video-formats skill).

		## Language
		The script language is the project's language from read_script_settings. On auto, it is the language of the user's own topic or script, or English when that is unclear.
		- Every spoken or sung line is in the script language, wherever the format puts it: a <speech> element, speech quoted in a <video> prompt, or the lyrics of a <music> prompt.
		- Everything else in <image>, <video>, <sound> and <music> prompts is in English, and so is avatar, location, prop and style text.

		## Names
		Write each character, location and prop in an <image> or <video> prompt as ${nameRef("Name")}, with its exact name, like ${nameRef("Red")} or ${nameRef("Cottage")}. Never describe how one looks, since the model sees it. Speech elements and every other prompt name them plainly.

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
		- Name characters, locations and props as {{Name}}, as Names says.
		- motion: a camera move for the whole time the image is on screen. Set one on almost every image. Allowed values: ${MOTION_EFFECTS.join(", ")}.
		- Example: <image motion="kenBurnsIn">{{Red}} hands a basket to {{Granny}} at the door of a thatched cottage on a rainy afternoon.</image>

		## <video>
		- A short generated video whose sound is written into its shots. The body is a video prompt, written as the video-prompts skill says.
		- duration: how many seconds to generate (default ${DEFAULT_DURATION}). Allowed values depend on its model: read_model_attributes lists them.
		- ${START_FRAME_ATTR}, ${CONTINUITY_ATTR} and ${loopDef.key}: see the video-formats skill.
		- motion: normally set to "${DEFAULT_MOTION}". Only set one when the shots have no camera move of their own.
		- Example: <video startFrame="none">Shot 1: Wide shot of a moonlit forest clearing as {{Red}} and {{Wolf}} walk in from the trees, rain falling through the branches. Sound: rain pattering on leaves, a stream nearby.</video>

		## <sound>
		- A sound effect that no <video> already makes. The body is a short, plain sound prompt, like rain, wind, a fire crackling or footsteps.
		- Place it right before the line it belongs to.
		- loops: how many times it plays back to back (default ${DEFAULT_LOOPS}). ${LOOPS_RULE} Use more for a sound that fills a scene, like rain or wind, and 1 for a single moment, like a door. Example:
		  <sound loops="4">Wind</sound>
		  <speech name="Narrator" emotion="peaceful">They walked through the windy forest.</speech>
		- Never a voice: no sighs, gasps, laughter or crying.

		## <music>
		- A music cue for the scenes from here to the next <music>. The body is a music prompt, written as the music-prompts skill says.
		- Place it right before the first element it plays under.
		- loops: how many times it plays back to back (default ${DEFAULT_LOOPS}). ${LOOPS_RULE} A cue written to its runtime plays once; use more only for a short bed that should repeat.
		- ${lyricsDef.key}: "${TOGGLE_ON}" makes the cue a song, sung over the scenes (default "${lyricsDef.default}", instrumental). Set it only when the story calls for a song, like a music video, a theme song or a character singing, and never under speech, where the singing would fight the voice.
	`,
} as const satisfies Skill;
