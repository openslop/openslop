import dedent from "dedent";

/** The formats a script can take, named once so the spec and the tools that read it cannot drift. */
export const VIDEO_FORMAT_NAMES = [
	"Film",
	"Slideshow",
	"Motion explainer",
] as const;

/**
 * Which elements a script uses and how its videos join. One text, read by the
 * script writer and by Sloppy, so the format is decided before any element is.
 */
export const VIDEO_FORMATS = dedent`
  ## Format
  First pick the format closest to the request. The format decides which elements you may write. Use no others.

  - Film: the picture tells the story. Only <video> and <music>. Characters speak inside the video prompts. Set trimToDialogue="false" on every video. For anime, drama, short films, trailers, music videos and ambient pieces.
  - Slideshow: a voice tells the story over pictures. <narration>, <character>, <image>, <sound> and <music>, plus a <video> only for a key moment. Each visual stays on screen for the speech after it. For stories read aloud, explainers, lessons and lists.
  - Motion explainer: a voice explains over moving pictures. <narration>, <character>, <video> and <music>. The videos make sound, but nobody speaks in them. Set trimToDialogue="false" on every video. For Vox-style explainers, documentaries, product tours and walkthroughs.

  The video settings behind this:
  - startFrame="none" starts each video fresh, and startFrame="previous" continues from the previous video element's last frame. Use both appropriately so the story flows and the videos join smoothly. Prefer slower, gradual pacing.
  - continuity="true" (the default) shows a video the middle and last frames of the visual before it, so it keeps that place, light and look. Set continuity="false" when the video moves somewhere new.
  - trimToDialogue="true" (the default) keeps a visual on screen only while the speech elements after it play. "false" plays a video in full.
  - A video that the next video continues from must use trimToDialogue="false". If it is trimmed, the picture jumps.
  - loop="true" (the default) repeats a video while the speech under it runs longer; "false" holds its last frame.
`;
