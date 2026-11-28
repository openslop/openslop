import { dedent } from "@/lib/dedent";
import {
	PREVIOUS_VISUAL,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/start-frame";
import type { Skill } from "./registry";
import { VIDEO_FORMAT } from "./video-formats";

// Plain labels and quotes read the same on every video model, where brackets are one vendor's dialect and reparse as tags in a script.
export const videoPrompts = {
	name: "video-prompts",
	description:
		"How to write a <video> prompt: numbered shots, camera, place, characters, action, speech and sound. Load it before writing or reviewing video prompts.",
	content: dedent`
		A <video> prompt has one to three shots, each on its own line and labelled Shot 1, Shot 2, Shot 3, even if there is only one. Use one shot for a quiet moment or a static graphic, and two or three for action, a reveal or a conversation. The video model sees only this prompt, so include every detail it needs, except the art style and how characters look.

		Describe each shot in detail:
		- Camera: the shot size (wide, medium, close-up) and the angle.
		- Location: the place, time of day, light, and weather if outdoors.
		- Characters: everyone in frame as {{Name}}, where they stand and which way they face.
		- Action: one clear action and facial expression per character.
		- Objects: key props, where they are and what state they're in.
		- Then any Speech, then Sound.

		- Keep positions consistent between shots: someone on the left stays on the left unless they move, and eyelines match (if {{Kai}} looks up at {{Mia}}, {{Mia}} looks down at {{Kai}}).
		- Outside spoken lines, always call a character by {{Name}}, never "he", "she" or "the boy". The model only knows who someone is from their {{Name}}.
		- Sound: what makes the noise and how close it is ("rain drumming on a tin roof, a car passing far off"), not a mood. No music or voice-over.
		- Speech: {{Name}} (tone): "line". Keep it natural for the moment.
		- When the video has a ${START_FRAME_ATTR} (${PREVIOUS_VISUAL} or a picture's URL), Shot 1 must begin with exactly what that frame shows: the same place, framing, characters and action, before moving on.
		- Example, 15 seconds (for ${VIDEO_FORMAT.cinematic} type):
		  Shot 1: Low-angle wide shot, static camera. A penthouse at midnight in a thunderstorm: a shattered glass skylight, rain pouring through onto a white marble floor, tall windows on the right glowing with city lights, cold blue flashes of lightning from above. {{Kai}} falls through the skylight in the centre of frame, back to camera, arms flung wide. Three masked assassins crouch on the broken roof frame above {{Kai}}, facing down. Sound: glass shattering close by, wind roaring overhead.
		  Shot 2: High-angle medium shot looking up through the broken skylight, slow push-in. The same stormy midnight sky, rain falling toward camera, purple light from the assassins' blades glinting on the wet steel frame. The three assassins kneel side by side on the frame, the lead assassin in the middle facing down toward camera, a crackling purple blade in each right hand. The lead assassin (cold, muffled): "Target found. Get him before dawn." Sound: rain hissing on the blades.
		- Example, 12 seconds (for ${VIDEO_FORMAT.explainer} type):
		  Shot 1: Animated explainer map of Afghanistan, flat cut-paper collage style. The camera holds perfectly still on a locked-off shot; the gray terrain basemap stays completely static and undistorted. Two orange paper tank cutouts slide across the map on their own layer, gliding southeast toward the orange star at Kabul, each with a subtle drop shadow that separates them from the map beneath. The orange "Afghan government" label snaps into place with a quick scale-up and slight settle, like a paper card dropped onto the surface. The word AFGHANISTAN stays fixed and crisp. Clean graphic motion, no camera push, no zoom, no 3D parallax, no texture warping.
	`,
} as const satisfies Skill;
