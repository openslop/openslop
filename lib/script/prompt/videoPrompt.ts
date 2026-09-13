import dedent from "dedent";

/**
 * How a video prompt is written, by the script writer and by Sloppy alike.
 * Plain labels and quotes read the same on every video model, where brackets
 * and braces are one vendor's dialect and reparse as tags in a script.
 */
export const VIDEO_PROMPT_FORMAT = dedent`
  ## Video prompts
  A <video> prompt is one line of numbered shots, about one shot per 3 to 5 seconds. Each shot says the framing and camera move, what happens, the setting details that matter, and then what it sounds like: Shot 1: ... Sound: ... Shot 2: ... Sound: ...
  - Sound: name what makes the noise and how near it is ("rain drumming on a tin roof, a car passing far off"), never a mood. No music and no narration: those are their own elements.
  - Leave Sound out of the last shot when you can: sound at the very end of a video tends to get cut off.
  - Speech: only when no narration or character line plays over the video. Write it inside its shot as Name (tone): "line", one short sentence per shot in simple everyday words that fits what is happening.
  - A video that continues from the one before (startFrame="previous") starts where that video's last shot ends: Shot 1 keeps its place, framing, characters and action, then moves on from there.
  - Every character in the video appears in Shot 1. Never bring a new character into a later shot.
  - Name characters and never describe how they look. Never write the art style, timestamps or subtitles, and never use angle brackets or curly braces.
  - Example, 12 seconds with nothing narrated over it:
    Shot 1: Low-angle wide shot as Kai plummets through a shattered penthouse skylight into a rainy night, three masked assassins crouched on the broken roof frame above him. Sound: glass shattering close by, wind roaring. Shot 2: Kai twists mid-air and grabs a steel beam with one hand, his body swinging hard. Sound: a metallic clang, a strained grunt. Shot 3: High-angle shot up through the broken roof at the three assassins, their blades crackling with purple light. The lead assassin (cold, muffled): "Target found. Get him before dawn."
`;
