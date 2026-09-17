import dedent from "dedent";

/**
 * Plain labels and quotes read the same on every video model, where brackets
 * and braces are one vendor's dialect and reparse as tags in a script.
 */
export const VIDEO_PROMPT_FORMAT = dedent`
  ## Video prompts
  A <video> prompt is one or two numbered shots. Each video prompt is standalone, so it should include all relevant detail.

  Describe each shot in vivid detail, including:
  - Camera: the shot size (wide, medium, close-up) and the angle.
  - Location: location in detail, the time of day, the light and the weather if outdoors.
  - Characters: every character in frame by name, exactly where each one is in the place, which way each one faces.
  - Action: one clear action for each character and the expression on their face.
  - Objects: important props and set pieces, where they sit and what state they are in.
  - Depth: what fills the foreground and what stands in the background.
  - Then any Speech, then Sound.

  - Keep the geography steady from shot to shot: a character on the left of frame stays on the left unless the shot shows them moving, and eyelines match (when Kai looks up at Mia, Mia looks down at Kai).
  - Sound: name what makes the noise and how near it is ("rain drumming on a tin roof, a car passing far off"), never a mood. NEVER include music or narration in the video prompt.
  - Speech: Write it as Name (tone): "line", one short sentence per shot in simple everyday words. Ensure the speech is perfectly idiomatic, appropriate, and realistic for the shot.
  - A video that continues from the one before (startFrame="previous") starts where that video's last shot ends: Shot 1 keeps its place, framing, characters and action, then moves on from there.
  - Refer to characters by name in the video prompt, do not describe their appearance since this is already in the reference images passed to the model.
  - Example, 15 seconds:
    Shot 1: Low-angle wide shot, static camera. A penthouse at midnight in a thunderstorm: a shattered glass skylight, rain pouring through onto a white marble floor, tall windows on the right glowing with city lights, cold blue flashes of lightning from above. Kai falls through the skylight in the centre of frame, back to camera, arms flung wide. Three masked assassins crouch on the broken roof frame above him, facing down at him. Sound: glass shattering close by, wind roaring overhead. Shot 2: High-angle medium shot looking up through the broken skylight, slow push-in. The same stormy midnight sky, rain falling toward camera, purple light from the assassins' blades glinting on the wet steel frame. The three assassins kneel side by side on the frame, the lead assassin in the middle facing down toward camera, a crackling purple blade in each right hand. The lead assassin (cold, muffled): "Target found. Get him before dawn." Sound: rain hissing on the blades.
`;
