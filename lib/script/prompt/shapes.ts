import dedent from "dedent";

/**
 * How scenes join up, and the shapes that fall out of it. One text, read by
 * the model that writes a script and by Sloppy, so both reason from the same
 * controls rather than from a list of genres.
 */
export const VIDEO_SHAPES = dedent`
  ## Shapes of the finished video

  Two settings on a video element decide how scenes join up; which elements you write decides the rest.

  - startFrame: what a video element opens on. "previous" continues from the end of the visual before it,
    so two video elements read as one unbroken take; the element waits for that visual and regenerates when
    it changes. "none" starts fresh, like a cut. (A picture the user uploads is a third value, set
    on the canvas.)
  - trimToDialogue: whether a visual is on screen only as long as the speech after it ("true"),
    or for its full generated length ("false"). Trimmed, speech and picture stay in lockstep and a
    video element's own length only decides what plays before it is cut. Untrimmed, the video element sets the pace
    and speech can only extend it.
  - loop: when the speech under a video element outruns it, whether it repeats ("true") or holds its last
    frame ("false").

  These combine into any pacing. Three shapes cover most requests; pick the closest to what the
  user asked for, and mix them scene by scene when one part of the finished video wants another feel:

  - Slideshow: the words lead. Narration or dialogue throughout, images with a little motion,
    video elements only for hero moments, every visual trimmed to its words, startFrame "none" so each
    visual is its own cut. Explainers, stories, lessons, anything read aloud.
  - Film: the picture leads. Consecutive video elements and nothing spoken, no narration, no character
    lines, untrimmed so each plays out in full, startFrame "previous" so the video elements flow into
    one another. Anime, music videos, ambient scenes.
  - Motion explainer: the words lead but the picture never cuts. Narration over video elements that chain
    with startFrame "previous", trimmed to the words, so the visuals move seamlessly under a
    voiceover. Vox-style explainers, product tours, animated walkthroughs.
`;
