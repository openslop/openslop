import { animateImage } from "./animate-image";
import { assets } from "./assets";
import { mediaLibrary } from "./media-library";
import { musicPrompts } from "./music-prompts";
import { osml } from "./osml";
import { reviewScript } from "./review-script";
import { videoFormats } from "./video-formats";
import { videoPrompts } from "./video-prompts";
import { writeScript } from "./write-script";

/** The shape AI SDK harnesses take for `skills`, so this list can be handed to one as it stands. */
export type Skill = { name: string; description: string; content: string };

export const SKILLS = [
	writeScript,
	animateImage,
	reviewScript,
	assets,
	osml,
	videoFormats,
	videoPrompts,
	musicPrompts,
	mediaLibrary,
] as const satisfies readonly Skill[];

export type SkillName = (typeof SKILLS)[number]["name"];

export const SKILL_NAMES = SKILLS.map(({ name }) => name) as [
	SkillName,
	...SkillName[],
];

export const SKILL_INDEX = SKILLS.map(
	({ name, description }) => `- ${name}: ${description}`,
).join("\n");
