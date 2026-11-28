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
		The script is XML with one tag per element, in play order. Never nest tags. Write only the story, using only the elements the format allows (see video-formats).

		## Language
		The script language is the language in read_script_settings. If it is auto, use the language the user wrote their topic or script in, or English if unsure.
		- Everything spoken or sung is in the script language: <speech>, lines inside a <video> prompt, and <music> lyrics.
		- Everything else is in English: the rest of every prompt, and avatar, location, prop and style text.
		- This holds when you edit, too, even when the user writes to you in another language.

		## Names
		In <image> and <video> prompts, write each character, location and prop as ${nameRef("Name")} with its exact name, like ${nameRef("Red")} or ${nameRef("Cottage")}. Don't describe how it looks, since the model gets its picture. Everywhere else, use the plain name.

		## <speech>
		- A line one character says out loud. name (required) is who says it. Example: <speech name="Lyra" emotion="excited">Truce?</speech>
		- emotion: ${TTS_EMOTIONS.join(", ")}. speed: ${TTS_SPEEDS.join(", ")}.
		- No words in ALL CAPS, the voice model mispronounces them. Acronyms like USA are fine.
		- [laughter] is the only sound cue. Use a comma or full stop for a pause and ! for strong feeling. Example: <speech name="Mia" emotion="happy">[laughter] That's the way I want it!</speech>
		- The audience never reads the prompts, so the speech can mention some of what's on screen.

		## <image>
		- The body is an image prompt: time of day, background, weather if outdoors, and objects, in detail.
		- Show the moment the speech after it describes: who is there, what they're doing and their expressions, not just the setting.
		- The image model sees only this prompt, so include every detail it needs.
		- motion: a camera move while the image is on screen. Set one on almost every image. Values: ${MOTION_EFFECTS.join(", ")}.
		- Example: <image motion="kenBurnsIn">{{Red}} hands a basket to {{Granny}} at the door of a thatched cottage on a rainy afternoon.</image>

		## <video>
		- A short generated video, with sound. The body is a video prompt (see video-prompts).
		- duration: seconds to generate (default ${DEFAULT_DURATION}).
		- ${START_FRAME_ATTR}, ${CONTINUITY_ATTR} and ${loopDef.key}: see video-formats.
		- motion: usually "${DEFAULT_MOTION}". Set one only when the shots have no camera move.
		- Example: <video startFrame="none">Shot 1: Wide shot of a moonlit forest clearing as {{Red}} and {{Wolf}} walk in from the trees, rain falling through the branches. Sound: rain pattering on leaves, a stream nearby.</video>

		## <sound>
		- A sound effect a <video> doesn't already have. The body is a short prompt, like rain, wind, a crackling fire or footsteps.
		- Put it right before the line it goes with.
		- loops: how many times it repeats (default ${DEFAULT_LOOPS}). ${LOOPS_RULE} Use more for background sounds like rain or wind, and 1 for a one-off like a door. Example:
		  <sound loops="4">Wind</sound>
		  <speech name="Narrator" emotion="peaceful">They walked through the windy forest.</speech>
		- No voices: no sighs, gasps, laughter or crying.

		## <music>
		- Music for the scenes from here to the next <music>. The body is a music prompt (see music-prompts).
		- Put it right before the first element it plays under.
		- loops: how many times it repeats (default ${DEFAULT_LOOPS}). ${LOOPS_RULE} Music written to its runtime plays once; repeat only a short loop.
		- ${lyricsDef.key}: "${TOGGLE_ON}" makes it a song with vocals (default "${lyricsDef.default}", instrumental). Use it only when the story needs a song, like a music video or a character singing, and never under speech.
	`,
} as const satisfies Skill;
