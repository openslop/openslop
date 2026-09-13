import dedent from "dedent";

/**
 * Which elements a script uses and how its videos join. One text, read by the
 * script writer and by Sloppy, so the shape is decided before any element is.
 */
export const VIDEO_SHAPES = dedent`
  ## Shape
  First pick the shape closest to the request. The shape decides which elements you may write. Use no others.

  - Film: the picture tells the story. Only <video> and <music>. Characters speak inside the video prompts. Set trimToDialogue="false" on every video, and keep startFrame="previous" unless the story cuts somewhere new. For anime, drama, short films, trailers, music videos and ambient pieces.
  - Slideshow: a voice tells the story over pictures. <narration>, <character>, <image>, <sound> and <music>, plus a <video> only for a key moment. Each visual stays on screen for the speech after it. Set startFrame="none" on a video. For stories read aloud, explainers, lessons and lists.
  - Motion explainer: a voice explains over moving pictures. <narration>, <video> and <music>. The videos make sound, but nobody speaks in them. Set trimToDialogue="false" on every video, and keep startFrame="previous". For Vox-style explainers, product tours and walkthroughs.

  The video settings behind this:
  - startFrame="previous" (the default) opens a video on the last frame of the visual before it, so the two play as one take. startFrame="none" starts fresh, like a cut.
  - trimToDialogue="true" (the default) keeps a visual on screen only while the speech after it plays. "false" plays a video in full.
  - A video that the next video continues from must use trimToDialogue="false". If it is trimmed, the picture jumps.
  - loop="true" repeats a video while the speech under it runs longer. Otherwise it holds its last frame.
`;
