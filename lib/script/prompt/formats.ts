import dedent from "dedent";
import { VIDEO_FORMAT_SPECS } from "@/lib/project/videoFormat";

export const VIDEO_FORMAT = {
	cinematic: VIDEO_FORMAT_SPECS.cinematic.label,
	faceless: VIDEO_FORMAT_SPECS.faceless.label,
	explainer: VIDEO_FORMAT_SPECS.explainer.label,
} as const;

export const VIDEO_FORMAT_NAMES = [
	VIDEO_FORMAT.cinematic,
	VIDEO_FORMAT.faceless,
	VIDEO_FORMAT.explainer,
] as const;

export const VIDEO_FORMATS = dedent`
	First pick the format closest to the request if not already picked by the user. The format decides which elements you write.

	- ${VIDEO_FORMAT.cinematic}: visuals and music tell the story. Only <video> and <music> (with occasional <narration>). Characters speak inside the video prompts. Set trimToDialogue="false" on every video. For anime, drama, short films, trailers, music videos and ambient pieces.
	- ${VIDEO_FORMAT.faceless}: narration and character dialogue tells the story over visuals. Use all elements. For stories read aloud, audiobooks, newscasts, visual dramas, and podcasts with visuals.
	- ${VIDEO_FORMAT.explainer}: dialogue over video. Use all elements except <image>. The videos make sound, but nobody speaks in them. Set trimToDialogue="false" on every video. For explainers, video essays, lessons, lists, documentaries, product tours and walkthroughs.

	The video settings behind this:
	- startFrame="none" starts each video fresh, and startFrame="previous" continues from the previous video element's last frame. Use both appropriately so the story flows and the videos join smoothly.
	- continuity="true" (the default) shows a video the beginning and middle frames of the visual before it, so it keeps that place, light and look. Set continuity="false" when the video moves somewhere new.
	- trimToDialogue="true" (the default) keeps a visual on screen only for the duration of the speech elements after it. "false" plays a video in full or while the speech after it is done playing, whichever comes later.
	- A video ending on a shot that is extended by the next video's first shot must use trimToDialogue="false", and any speech after it must be shorter than the video's runtime. Otherwise the picture jumps and continuity is broken.
	- loop="true" (the default) repeats a video while the speech under it runs longer; "false" holds its last frame.
`;
