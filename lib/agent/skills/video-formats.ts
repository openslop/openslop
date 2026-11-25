import mapValues from "lodash/mapValues";
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
import type { Skill } from "./registry";

export const VIDEO_FORMAT = mapValues(VIDEO_FORMAT_SPECS, (spec) => spec.label);

export const videoFormats = {
	name: "video-formats",
	description:
		"The formats of the finished video, which elements each allows, and how videos join (startFrame, continuity, loop). Load it before choosing a format, and with osml whenever you write or review a script.",
	content: dedent`
		The format decides which elements a script holds. If none is set, pick the closest one.

		- ${VIDEO_FORMAT.cinematic}: characters speak on screen, inside the video prompts. Only <video> and <music>, with occasional <speech>.
		- ${VIDEO_FORMAT.faceless}: voices tell the story over images and video. All elements.
		- ${VIDEO_FORMAT.explainer}: a voice over video in which nobody speaks. All elements except <image>.
		- ${VIDEO_FORMAT.audiobook}: voices with sound and music, nothing on screen. Only <speech>, <sound> and <music>.

		## How visuals join
		- ${START_FRAME_ATTR}="${NO_FRAME}" starts a video fresh, and ${START_FRAME_ATTR}="${PREVIOUS_VISUAL}" opens it on the visual before it: that image, or that video's last frame. Use both appropriately so the story flows and the videos join smoothly. The default is "${startFrameDef.default}".
		- ${CONTINUITY_ATTR}="${TOGGLE_OFF}" gives each video a fresh look; ${CONTINUITY_ATTR}="${TOGGLE_ON}" shows it the visual before it (an image, or the ${frameNames(CONTINUITY_FRAMES)} frames of a video) when the place, light and look should carry over. The default is "${continuityDef.default}".
		- A visual stays on screen while it plays or while the speech after it is playing, whichever ends later. An image has no length of its own; a video plays for its duration.
		- ${loopDef.key}="${TOGGLE_ON}" repeats a video while the speech after it runs longer; "${TOGGLE_OFF}" holds its last frame. The default is "${loopDef.default}".
		- When the next video continues a video's last shot, either make that video longer than the speech after it or set ${loopDef.key}="${TOGGLE_OFF}" on it, so it holds the frame the next one opens on. A video that loops back to its start makes the picture jump.
	`,
} as const satisfies Skill;
