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
		The format sets which elements a script can use. If none is set, pick the closest.

		- ${VIDEO_FORMAT.cinematic}: characters speak on screen, inside the video prompts. Only <video> and <music>, with occasional <speech>.
		- ${VIDEO_FORMAT.faceless}: voices tell the story over images and video. All elements.
		- ${VIDEO_FORMAT.explainer}: a voice over video in which nobody speaks. All elements except <image>.
		- ${VIDEO_FORMAT.audiobook}: voices with sound and music, nothing on screen. Only <speech>, <sound> and <music>.

		## How visuals join
		- ${START_FRAME_ATTR}="${NO_FRAME}" starts a video from scratch. ${START_FRAME_ATTR}="${PREVIOUS_VISUAL}" starts it on the previous visual: that image, or that video's last frame. Mix them so the videos join smoothly. Default "${startFrameDef.default}".
		- ${CONTINUITY_ATTR}="${TOGGLE_ON}" sends the previous visual (an image, or a video's ${frameNames(CONTINUITY_FRAMES)} frames) as a reference, so the place, light and look carry over. "${TOGGLE_OFF}" doesn't. Default "${continuityDef.default}".
		- A visual stays on screen until both it and the speech after it have finished. An image has no length of its own; a video lasts its duration.
		- ${loopDef.key}="${TOGGLE_ON}" replays a video if the speech after it is longer; "${TOGGLE_OFF}" freezes on its last frame. Default "${loopDef.default}".
		- If the next video starts on this video's last frame, make this video longer than its speech or set ${loopDef.key}="${TOGGLE_OFF}". Otherwise it loops back to the start and the cut jumps.
	`,
} as const satisfies Skill;
