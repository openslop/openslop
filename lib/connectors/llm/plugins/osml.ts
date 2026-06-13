import dedent from "dedent";
import { MOTION_EFFECTS } from "@/lib/video/motionEffects";
import { EffectType } from "@/lib/connectors/image/enums";
import { MusicLength } from "@/lib/connectors/music/enums";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_EMOTIONS,
	TTS_LANGUAGES,
	TTS_PITCHES,
	TTS_SPEEDS,
} from "@/lib/connectors/tts/enums";
import type { LLMPlugin } from "@/lib/connectors/types";

const OSML_SYSTEM_PROMPT = dedent`
	The story script must be written in a special XML format that strictly follows these rules: 

  ## **General Guidelines**
  - Never write words in ALL CAPS in narration or dialogue — the TTS engine mispronounces them. Acronyms (USA, FBI, NASA) stay capitalized; convey emphasis through word choice or punctuation.
  - Descriptions in image tags are opaque to the reader, so the narrative prose should include some details that are only in the image tags.

  ## **XML Tagging**

  ### Response XML Tags
  - Return only raw XML.
  - Do not wrap the output in markdown code fences.
  - Do not include xml, backticks, explanations, or any surrounding text.
  - The first character of your response must be < and the last character must be >.

  ### Narration XML Tags
  - The narration element is the primary voice of the story.
  - All narrative prose should be wrapped in narration XML tags. Example:
    <narration emotion="neutral">The sun was setting in the west, casting a warm glow on the forest.</narration>
  - Supported attributes for narration tags are emotion and captions

  ### Character Dialogue XML Tags
  - Each character's entire dialogue is wrapped in character XML tags with required attributes being name and emotion. Example:
    <narration emotion="neutral">Lyra steps forward. </narration>
    <character name="Lyra" emotion="excited">Truce?</character>
  - Frequently use nonverbalisms. Example: <character name="Mia" emotion="happy">[laughter] That's the way I want it!</character>.
  - Allowed list of nonverbalisms: [laughter]. Do not use any other nonverbalisms.
  - Occasionally insert ellipsis (...) to indicate a pause or a break in the dialogue, or use exclamations (!) to indicate a strong emotion or action.
	- Supported attributes for character tags are name, emotion, and captions

	### Narration and Character XML Tags
	- For both character and narration tags, the emotion attribute should be appropriately set to one of the following: ${TTS_EMOTIONS.join(", ")}.
	- For both character and narration tags, the speed attribute should be appropriately set to one of the following: ${TTS_SPEEDS.join(", ")}.
	- The optional captions attribute is "on" or "off" (default "on") and controls whether on-screen subtitle text is overlaid during the element's audio.

  ### Image XML Tags
  - Each scene should include an image XML tag that describes the current scene. Example:
		<image>A dark forest with a clearing in the center. A full moon shines through the trees, casting eerie shadows.</image>
  - motion: Optional camera-motion effect applied for the element's full duration. Use sparingly — at most one per scene, and prefer omitting when the image already carries the energy. Example: <image motion="kenBurnsIn">...</image>
  - Allowed motion values: ${MOTION_EFFECTS.join(", ")}
	- characters: Include a comma-separated list of character names that occur in the image. These should be characters from the story with their exact names. Example:
		<image characters="Red,Granny">Red hands the basket to Granny at the cottage door.</image>
  - After the metadata tags, open the story with an <image> tag that describes the image for the opening scene.
  - Frequently change the image at least every 2 narrative lines.
  - As appropriate, add an overlays attribute to the <image> tag. Example: <image overlays="smoke,lightning">A thunderclap echoes through the forest. A bolt of lightning strikes a tree.</image>
  - For example, if there is rain in the image, add the rain overlay. If there is smoke, add the smoke overlay. If there is lightning, add the lightning overlay. If there are multiple effects, add all of them.
  - Overlays should be a comma-separated list containing any of the following: ${Object.values(
		EffectType,
	).join(", ")}
  - Image descriptions should describe the time of day, the background, the weather (if outdoors), and objects in detail.
  - Each <image> description must be written as a standalone prompt, as if the generative image model has absolutely no knowledge of the story, prior images, or previous prompts.
	- Reference characters by their names in the image description, NEVER describe their appearance in the image description
  - Each image description should include all relevant details about the scene (except for art style and character descriptions), even if this requires repeating details from previous descriptions or the story.

  ### Animated Image XML Tags
  - An <animated_image> tag is an <image> tag whose still frame is then animated by an image-to-video model. Use it for hero moments, establishing shots, or emotional beats that benefit from subtle motion. The tag body describes the still frame in the same way as an <image>; the videoPrompt attribute describes the camera/subject motion. Example:
		<animated_image videoPrompt="slow zoom out revealing the full landscape" motion="kenBurnsIn" characters="Red,Wolf" overlays="rain">A dark forest with a clearing in the center. A full moon shines through the trees, casting eerie shadows. Red (a cheerful girl with warm brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak) walks beside Wolf (a large gray wolf with kind amber eyes, soft thick fur).</animated_image>
  - videoPrompt: required. A short, focused, relaxing description of the motion or camera movement (e.g. "slow cinematic pan", "gentle dolly in", "warm zoom on the character's face"). Keep it simple — one camera move per shot.
  - motion: optional. Same enum as for <image>. Allowed motion values: ${MOTION_EFFECTS.join(", ")}.
  - characters: optional. Same as for <image> — a comma-separated list of exact story character names appearing in the frame. Example: <animated_image videoPrompt="..." characters="Red,Granny">Red hands the basket to Granny at the cottage door.</animated_image>
  - All <image> description rules apply unchanged: write a prompt that describes the time of day, background, weather, and objects in detail. Repeat any details necessary even if they appeared in earlier prompts.
  - Use <animated_image> sparingly — mostly at intro shots and hero moments. Default to <image> for typical scenes; image-to-video generation is significantly slower and more expensive.

  ### Sound XML Tags
  - Frequently break up character (including narration) dialogue to insert <sound> tags (as if prompting a sound model) that should accompany a scene.
  - The descriptions within <sound> tags should be common, simple, short, clear ASMR pleasing sound descriptions like rain, wind, fire crackling, footsteps, etc.
  - The optional loops attribute is an integer (default 1) that controls how many times the generated sound clip plays back-to-back. Use a higher loops value for atmospheric beds that should fill a scene (rain, wind, birds, stream, ocean) and 1 (or omit) for one-shot punctual sounds tied to a narrative beat (footsteps, doors, bridge creak). Example:
    <narration emotion="peaceful">They walked through the windy forest, the air was crisp.</narration>
    <sound loops="4">Wind</sound>
    <narration emotion="alarmed">Suddenly, they heard a tiger roar in the distance.</narration>
    <sound>Tiger roar</sound>
  - One-shot sound tags should be placed right after the narrative prose that describes the sound. Example:
    <narration emotion="calm">Hana slowly walks into the room</narration>
    <sound>footsteps</sound>
    <narration emotion="calm">and opens the door</narration>
    <sound>door creaks</sound>
  - Sounds should be subtle, pleasing background sounds like rain, wind, fire crackling, ocean waves, forest birds, river flowing, coffee shop ambient noise, etc.
  - Sounds should NEVER be vocal (no sighing, no gasping, no moaning, no laughter, no crying, etc)

  ### Music XML Tags
  - As appropriate, insert tags to describe the type of music that should accompany a scene (as if prompting a text-to-music model). Example:
		<music length="long">Soft, slow, sad piano music for a romantic breakup</music>
		or
		<music length="medium">Epic battle over snow-covered mountains, powerful brass, pounding timpani, fast, heroic</music>
	- The descriptions within <music> tags should be common, simple, short, clear, and direct.
  - Music should change frequently (at least once every few scenes) to keep the reader engaged.
  - length: ${Object.values(MusicLength).join(", ")}
  - The optional loops attribute is an integer (default 1) that controls how many times the generated music clip plays back-to-back; use higher values for atmospheric music beds that should fill multiple scenes.

	### Metadata Title XML tag
	- The script must begin with a single, short <metadata_title>...</metadata_title> tag containing a succinct title (1-4 words) for the story. Example:
	<metadata_title>Little Red</metadata_title>

	### Metadata Style XML tag
	- Right after the metadata_title tag, emit a single, concise <metadata_style>...</metadata_style> tag that describes the visual style of the story as if prompting an image model. Example:
	<metadata_style>Warm, earth tones. Whimsical storybook illustration with soft watercolors, gentle brush strokes, warm lighting.</metadata_style>

	### Metadata Narration XML tags
	- Right after the metadata_style tag, emit a single, empty metadata_narration tag that describes the narrator voice. Example:
		 <metadata_narration gender="masculine" age="adult" pitch="low" accent="british" description="wise" language="en"></metadata_narration>
	- The attributes should be from the metadata Character/Narration attributes section

  ### Metadata Character XML tags
	- Right after the metadata_narration tag, emit short <metadata_character>...</metadata_character> tags that describe each character's visual appearance (excluding the narrator) from the story in detail as if prompting an image model. Example:
		<metadata_character name="Mia" gender="feminine" age="child" pitch="high" accent="american" description="wise" language="en">A girl around ten years old with warm brown skin, dark curly hair falling
		just past her shoulders, bright hazel eyes, a small gap between her front
		teeth. Wearing a mustard-yellow cardigan over a white tee, rolled-up denim
		overalls, scuffed red sneakers, a canvas satchel slung across one shoulder.
		</metadata_character>
	- name: the exact name for the character (case-sensitive) used in the story

	### Metadata Character/Narration attributes
	- For metadata_character and metadata_narration tags, always include these attributes in addition to any other they may have
  - gender: ${TTS_GENDERS.join(", ")}.
  - age: ${TTS_AGES.join(", ")}.
  - pitch: ${TTS_PITCHES.join(", ")}.
  - accent: ${TTS_ACCENTS.join(", ")}.
  - description: A simple descriptor of the voice. Examples: Charming, Confident, Approachable, Friendly, Energetic, Casual, Mature, Warm, Clear, Upbeat, Deep, Soft, etc.
  - language: ISO 639-1 code of the spoken language. Allowed values: ${TTS_LANGUAGES.join(", ")}. Default to "en" when unspecified.

  ### General XML Tag Rules
  - NEVER nest XML tags within other XML tags.
`;

export const osmlPlugin: LLMPlugin = {
	name: "osml",
	beforeGenerate(params) {
		if (!params.systemPrompt) {
			return { ...params, systemPrompt: OSML_SYSTEM_PROMPT };
		}
		return params;
	},
};
