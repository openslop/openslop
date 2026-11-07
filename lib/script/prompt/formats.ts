import { dedent } from "@/lib/dedent";
import { TOGGLE_OFF, TOGGLE_ON } from "@/lib/canvas/types";
import { loopDef } from "@/lib/connectors/attributes/common";
import {
	CONTINUITY_ATTR,
	CONTINUITY_FRAMES,
	frameNames,
	NO_FRAME,
	PREVIOUS_VISUAL,
	START_FRAME_ATTR,
	continuityDef,
	startFrameDef,
} from "@/lib/connectors/video/start-frame";
import { VIDEO_FORMAT_SPECS } from "@/lib/project/video-format";

export const VIDEO_FORMAT = {
	cinematic: VIDEO_FORMAT_SPECS.cinematic.label,
	faceless: VIDEO_FORMAT_SPECS.faceless.label,
	explainer: VIDEO_FORMAT_SPECS.explainer.label,
} as const;

export const VIDEO_FORMAT_RULES = dedent`
	First pick the format closest to the request if not already picked by the user. The format decides which elements you write.

	- ${VIDEO_FORMAT.cinematic}: visuals and music tell the story. Only <video> and <music> (with occasional <narration>). Characters speak inside the video prompts. For anime, drama, short films, trailers, music videos and ambient pieces.
	- ${VIDEO_FORMAT.faceless}: narration and character dialogue tells the story over visuals. Use all elements. For stories read aloud, audiobooks, newscasts, visual dramas, and podcasts with visuals.
	- ${VIDEO_FORMAT.explainer}: dialogue over video. Use all elements except <image>. The videos make sound, but nobody speaks in them. For explainers, video essays, lessons, lists, documentaries, product tours and walkthroughs.

	The video settings behind this:
	- ${START_FRAME_ATTR}="${NO_FRAME}" starts a video fresh, and ${START_FRAME_ATTR}="${PREVIOUS_VISUAL}" opens it on the visual before it: that image, or that video's last frame. Use both appropriately so the story flows and the videos join smoothly. The default is "${startFrameDef.default}".
	- ${CONTINUITY_ATTR}="${TOGGLE_OFF}" gives each video a fresh look; ${CONTINUITY_ATTR}="${TOGGLE_ON}" shows it the visual before it (an image, or the ${frameNames(CONTINUITY_FRAMES)} frames of a video) when the place, light and look should carry over. The default is "${continuityDef.default}".
	- A visual stays on screen while it plays or while the speech after it is playing, whichever ends later. An image has no length of its own; a video plays for its duration.
	- ${loopDef.key}="${TOGGLE_ON}" repeats a video while the speech after it runs longer; "${TOGGLE_OFF}" holds its last frame. The default is "${loopDef.default}".
	- When the next video continues a video's last shot, either make that video longer than the speech after it or set ${loopDef.key}="${TOGGLE_OFF}" on it, so it holds the frame the next one opens on. A video that loops back to its start makes the picture jump.
`;
