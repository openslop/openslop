import dedent from "dedent";

export const VIDEO_FORMAT = {
	film: "Film",
	visualStory: "Visual Story",
	motionExplainer: "Motion explainer",
} as const;

export const VIDEO_FORMAT_NAMES = [
	VIDEO_FORMAT.film,
	VIDEO_FORMAT.visualStory,
	VIDEO_FORMAT.motionExplainer,
] as const;

export const VIDEO_FORMATS = dedent`
  First pick the format closest to the request. The format decides which elements you may write. Use no others.

  - ${VIDEO_FORMAT.film}: the picture tells the story. Only <video> and <music>. Characters speak inside the video prompts. Set trimToDialogue="false" on every video. For anime, drama, short films, trailers, music videos and ambient pieces.
  - ${VIDEO_FORMAT.visualStory}: narration and character dialogue tells the story over visuals. Use all elements. For stories read aloud, audiobooks, newscasts, and podcasts with visuals.
  - ${VIDEO_FORMAT.motionExplainer}: a voice explains over primarily moving pictures. Use all elements except <image>. The videos make sound, but nobody speaks in them. Set trimToDialogue="false" on every video. For explainers, video essays, lessons, lists, documentaries, product tours and walkthroughs.

  The video settings behind this:
  - startFrame="none" starts each video fresh, and startFrame="previous" continues from the previous video element's last frame. Use both appropriately so the story flows and the videos join smoothly.
  - continuity="true" (the default) shows a video the beginning and middle frames of the visual before it, so it keeps that place, light and look. Set continuity="false" when the video moves somewhere new.
  - trimToDialogue="true" (the default) keeps a visual on screen only while the speech elements after it play. "false" plays a video in full or while the speech after it is done playing, whichever comes later.
  - A video ending on a shot that is extended by the next video's first shot must use trimToDialogue="false", and any speech after it must be shorter than the video's runtime. Otherwise the picture jumps and continuity is broken.
  - loop="true" (the default) repeats a video while the speech under it runs longer; "false" holds its last frame.
`;
