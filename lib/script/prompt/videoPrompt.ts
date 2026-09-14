import dedent from "dedent";

const LAST_SHOT_MIN_SEC = 3;

/**
 * How a video prompt is written, by the script writer and by Sloppy alike.
 * Plain labels and quotes read the same on every video model, where brackets
 * and braces are one vendor's dialect and reparse as tags in a script.
 */
export const VIDEO_PROMPT_FORMAT = dedent`
  ## Video prompts
  A <video> prompt is one line of two or more numbered shots. The last shot is always the longest, at least ${LAST_SHOT_MIN_SEC} seconds, because the video cuts straight to what comes next: give it one slow, simple action that holds. The shots before it are quick, so a short video has just two. Each shot gives the framing and camera move, what happens, the setting details that matter, then any speech. Every shot except the last ends with Sound:. The last shot has no Sound and no speech, because the end of a video gets cut off: Shot 1: ... Sound: ... Shot 2: ... Sound: ... Shot 3: ...
  - Sound: name what makes the noise and how near it is ("rain drumming on a tin roof, a car passing far off"), never a mood. No music and no narration: those are their own elements.
  - Speech: only when no narration or character line plays over the video. Write it inside its shot as Name (tone): "line", one short sentence per shot in simple everyday words that fits what is happening.
  - A video that continues from the one before (startFrame="previous") starts where that video's last shot ends: Shot 1 keeps its place, framing, characters and action, then moves on from there.
  - Every character in the video appears in Shot 1. Never bring a new character into a later shot.
  - Name characters and never describe how they look. Never write the art style, timestamps or subtitles, and never use angle brackets or curly braces.
  - Example, 12 seconds with nothing narrated over it:
    Shot 1: Low-angle wide shot as Kai plummets through a shattered penthouse skylight into a rainy night, three masked assassins crouched on the broken roof frame above him. Sound: glass shattering close by, wind roaring. Shot 2: High-angle shot up through the broken roof at the three assassins, their blades crackling with purple light. The lead assassin (cold, muffled): "Target found. Get him before dawn." Sound: rain hissing on the blades. Shot 3: Slow push-in on Kai hanging from a steel beam by one hand, swinging gently as rain streams past him, his eyes fixed on the assassins above.
`;
