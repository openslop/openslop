import dedent from "dedent";
import { EffectType } from "../image/enums";
import { MusicLength } from "../music/enums";
import {
	TTSAccent,
	TTSAge,
	TTSEmotion,
	TTSGender,
	TTSPitch,
} from "../tts/enums";
import type { LLMPlugin } from "../types";

const OSML_SYSTEM_PROMPT = dedent`
	The story script must be written in a special XML format that strictly follows these rules: 

  ## **General Guidelines**
  - For text within narration and character tags, never write any words in ALL CAPS.
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
  - The only supported attribute for narration tags is emotion

  ### Character Dialogue XML Tags
  - Each character's entire dialogue is wrapped in character XML tags with required attributes being name and emotion. Example:
    <narration emotion="neutral">Lyra steps forward. </narration>
    <character name="Lyra" emotion="excited">"Truce?"</character>
  - Frequently use nonverbalisms to exaggerate the emotion. Example: <character name="Mia" emotion="happy">"[laughter] That's the way I want it!"</character>.
  - Allowed list of nonverbalisms: [laughter]. Do not use any other nonverbalisms.
  - Occasionally insert ellipsis (...) to indicate a pause or a break in the dialogue, or use exclamations (!) to indicate a strong emotion or action.
	- The only supported attribute for character tags is emotion

	### Narration and Character XML Tags
	- For both character and narration tags, the emotion attribute should be appropriately set to one of the following: ${Object.values(TTSEmotion).join(", ")}.

  ### Image XML Tags
  - Each scene should include an image XML tag that describes the current scene with required attributes: animate, animation. Example:
		<image animate="true" animation="slow zoom out revealing the full landscape">A dark forest with a clearing in the center. A full moon shines through the trees, casting eerie shadows.</image>
  - animate: Include a required animate attribute that is either "true" or "false". This controls whether the image is animated or static.
  - animation: If animate is "true", include an animation attribute that describes the motion/camera movement for the video. The animation description should be simple, focused, and relaxing.
	- characters: Include a comma-separated list of character names that occur in the image. These should be characters from the story with their exact names. Example:
		<image characters="Red,Granny">Red hands the basket to Granny at the cottage door.</image>
  - After the metadata tags, open the story with an <image> tag that describes the image for the opening scene.
  - Frequently change the image at least every 2 narrative lines.
  - As appropriate, add an overlays attribute to the <image> tag. Example: <image overlays="smoke,lightning">A thunderclap echoes through the forest. A bolt of lightning strikes a tree.</image>
  - For example, if there is rain in the image, add the rain overlay. If there is smoke, add the smoke overlay. If there is lightning, add the lightning overlay. If there are multiple effects, add all of them.
  - Overlays should be a comma-separated list containing any of the following: ${Object.values(
		EffectType,
	).join(", ")}
  - Image descriptions should describe the characters (along with their gender, age, ethnicity, species, hair color, eye color, skin tone, clothing, and physical appearances), the time of day, the background, the weather (if outdoors), and objects in detail.
  - Each <image> description must be written as a fully standalone prompt, as if the generative image model has absolutely no knowledge of the story, characters, prior images, or previous prompts.
  - The first time a character is mentioned in each image tag description, describe the character next to their name. Example: "Kirito, a black haired Japanese boy with brown eyes and a white shirt..."
  - Each image description should include all relevant details about the scene (except for art style), even if this requires repeating details from previous descriptions or the story.

  ### Sound XML Tags
  - Frequently break up character (including narration) dialogue to insert tags to describe ambient and transient sounds (as if prompting a sound model) that should accompany a scene. Example:
    <narration emotion="peaceful">They walked through the windy forest, the air was crisp.</narration>
    <sound>Wind</sound>
    <narration emotion="alarmed">Suddenly, they heard a tiger roar in the distance.</narration>
    <sound">Tiger roar</sound>
  - The descriptions within <sound> tags should be common, simple, short, clear ASMR pleasing sound descriptions like rain, wind, fire crackling, footsteps, etc.
  - Transient sound tags should be inserted frequently within the narrative prose to describe sounds that are described by the narrator.
  - Transient sound tags should be placed right after the narrative prose that describes the sound. Example:
    <narration emotion="calm">Hana slowly walks into the room</narration>
    <sound>footsteps</sound>
    <narration emotion="calm">and opens the door</narration>
    <sound">door creaks</sound>
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

	### Metadata Style XML tag
	- The script must begin with a single, concise <metadata_style>...</metadata_style> tag that describes the visual style of the story as if prompting an image model. Example:
	<metadata_style>Warm, earth tones. Whimsical storybook illustration with soft watercolors, gentle brush strokes, warm lighting.</metadata_style>

	### Metadata Narration XML tags
	- Right after the metadata_style tag, emit a single, empty metadata_narration tag that describes the narrator voice. Example:
		 <metadata_narration gender="male" age="adult" pitch="low" accent="british" texture="wise"></metadata_narration>
	- The attributes should be from the metadata Character/Narration attributes section

  ### Metadata Character XML tags
	- Right after the metadata_narration tag, emit short <metadata_character>...</metadata_character> tags that visually describe each character (excluding the narrator) from the story in detail as if prompting an image model. Example:
		<metadata_character name="Mia" gender="female" age="child" pitch="high" accent="american" texture="wise">A girl around ten years old with warm brown skin, dark curly hair falling 
		just past her shoulders, bright hazel eyes, a small gap between her front
		teeth. Wearing a mustard-yellow cardigan over a white tee, rolled-up denim
		overalls, scuffed red sneakers, a canvas satchel slung across one shoulder.
		</metadata_character>
	- name: the exact name for the character (case-sensitive) used in the story

	### Metadata Character/Narration attributes
	- For metadata_character and metadata_narration tags, always include these attributes in addition to any other they may have
  - gender: ${Object.values(TTSGender).join(", ")}.
  - age: ${Object.values(TTSAge).join(", ")}.
  - pitch: ${Object.values(TTSPitch).join(", ")}.
  - accent: ${Object.values(TTSAccent).join(", ")}.
  - texture: Free-form short description of the voice texture, tone, and timbre. Example: "Bill Clinton-esque; charming", "Santa, wise, grandfatherly", "Viking, friendly, calm", etc.

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
