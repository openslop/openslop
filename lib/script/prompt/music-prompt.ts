import { dedent } from "@/lib/dedent";
import { NARRATION_WORDS_PER_SECOND } from "@/lib/project/video-length";
import { VIDEO_FORMAT } from "./formats";

export const MUSIC_PROMPT_FORMAT = dedent`
	## Music prompts
	A <music> prompt is a cue for the run of scenes it plays under, from where it sits to the next <music>, written like a line on a film cue sheet. The music model reads nothing but the prompt and takes its length from it, so the cue says:
	- Genre, instrumentation and production style, instrumental with no lyrics.
	- Runtime, as m:ss: the durations of the videos it covers added up, plus the speech under them at ${NARRATION_WORDS_PER_SECOND} words a second where the format has speech.
	- An arc: how it opens, each turn timestamped to what is on screen at that moment in those scenes, and how it ends.
	- Mood, key, tempo in BPM and meter.

	- In ${VIDEO_FORMAT.cinematic} the score carries the story, so every cue is written this fully: it builds into the reveals and resolves on the last shot it covers.
	- In ${VIDEO_FORMAT.faceless} and ${VIDEO_FORMAT.explainer} the music sits under speech: the same shape, sparser, with no melody that fights the voice, and still timed to the scenes it plays under.
	- Change cues where the story turns, not on a count of scenes.
	- Example, 2:30 (for ${VIDEO_FORMAT.cinematic} type):
	  Atmospheric cinematic orchestral piece, 2:30, nighttime and reverent, building to a grand awe-struck reveal. Opens with gentle, rocking low strings and soft harp in a slow 3/4 lilt, like small boats gliding across still, dark water. Muted French horn and solo oboe carry a quiet, wondering melody; distant wordless choir hums faintly underneath. Twinkling celesta and glockenspiel suggest lantern light reflecting on the lake. At 1:10, a slow crescendo: strings rise in layers, timpani rolls softly, the choir opens up. At 1:35, full orchestral swell with majestic brass and shimmering high strings as a towering, glowing castle comes into view. Ends with the melody returning softly on solo flute over sustained strings, hushed and full of promise. Mood: mystery, awe, quiet magic, the threshold of a new life. Key: D minor resolving to D major. Tempo: 70 BPM. Fantasy film score, lush full orchestra with choir, no lyrics.
`;
