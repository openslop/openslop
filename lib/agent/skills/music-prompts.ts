import { dedent } from "@/lib/dedent";
import { TOGGLE_ON } from "@/lib/canvas/types";
import { lyricsDef } from "@/lib/connectors/music/attributes";
import { SPEECH_WORDS_PER_SECOND } from "@/lib/project/video-length";
import type { Skill } from "./registry";
import { VIDEO_FORMAT } from "./video-formats";

export const musicPrompts = {
	name: "music-prompts",
	description:
		"How to write a <music> prompt as a film cue: genre, runtime, arc, mood, key and tempo, and lyrics for a song. Load it before writing or reviewing music prompts.",
	content: dedent`
		A <music> prompt is a cue for the run of scenes it plays under, from where it sits to the next <music>, written like a line on a film cue sheet. The music model reads nothing but the prompt and takes its length from it, so the cue says:
		- Genre, instrumentation and production style. Instrumental with no lyrics, unless ${lyricsDef.key}="${TOGGLE_ON}": then the vocal style too, and the prompt ends with Lyrics: and every line to sing, in the script language.
		- Estimated runtime, as m:ss: the scenes it covers added up, each lasting its video's duration or its speech at ${SPEECH_WORDS_PER_SECOND} words a second, whichever is longer.
		- An arc: how it opens, each turn timestamped to what happens at that moment, and how it ends.
		- Mood, key, tempo in BPM and meter.

		- Time the music to what is happening: it rises and falls with the story, and stays quiet under speech.
		- Change cues where the story turns, not on a count of scenes.
		- Example, 2:30 (for ${VIDEO_FORMAT.cinematic} type):
		  Atmospheric cinematic orchestral piece, 2:30, nighttime and reverent, building to a grand awe-struck reveal. Opens with gentle, rocking low strings and soft harp in a slow 3/4 lilt, like small boats gliding across still, dark water. Muted French horn and solo oboe carry a quiet, wondering melody; distant wordless choir hums faintly underneath. Twinkling celesta and glockenspiel suggest lantern light reflecting on the lake. At 1:10, a slow crescendo: strings rise in layers, timpani rolls softly, the choir opens up. At 1:35, full orchestral swell with majestic brass and shimmering high strings as a towering, glowing castle comes into view. Ends with the melody returning softly on solo flute over sustained strings, hushed and full of promise. Mood: mystery, awe, quiet magic, the threshold of a new life. Key: D minor resolving to D major. Tempo: 70 BPM. Fantasy film score, lush full orchestra with choir, no lyrics.
	`,
} as const satisfies Skill;
