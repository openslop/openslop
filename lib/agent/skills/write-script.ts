import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const writeScript = {
	name: "write-script",
	description:
		"Putting a new script on the canvas with write_script, written from an idea or converted from a script the user wrote (a screenplay, draft, prose, transcript or lyrics): settings, models, title, assets, then the script. Load it with osml, video-formats, video-prompts, music-prompts and assets to start a project, a fresh idea, or whenever the user's message carries a script of their own.",
	content: dedent`
		For a new script. For any change to an existing script, however large, follow edit-script.

		## Before writing
		1. read_script_settings, then settle the format, and for an idea the target length, with update_script_settings. Keep any setting the user set.
		2. list_models, then set_default_model for each kind of element the script will use. Keep any default the user set, and only pick models list_models returns. read_model_attributes lists what each allows, like its durations.
		3. Name the project with set_title unless read_title has one.
		4. Put the assets the script needs on the canvas with edit_script, as the assets skill says.
		5. read_media. If the user uploaded anything, load media-library and use it.

		## From an idea
		- When the project has a template, read_script_settings returns its guide and an example story: pastiche that format (tone, pacing, imagery, plot techniques, story beats, structure) and reframe it to be about the user's topic.
		- For a made-up story without a sufficient plot, outline it before writing: a high-concept premise, characters, themes, conflict, twists and a resolution. Skip the outline when the user already gave the plot, when a template sets the shape, or when the request isn't a story.
		- With a target length, write within its word budget, as update_script_settings lists them. Only spoken words count; prompts and attributes do not.

		## From the user's own script
		Their text is converted, not just stored: the format decides how their words are spoken. The target length and any template do not apply.
		- Keep their words EXACTLY, however long the script is. Never summarize, rewrite or shorten it, and never change, add or cut dialogue or prose. When you cannot tell where the script starts, keep the text rather than cut it.
		- Drop screenplay furniture (slug lines, stage directions, character cues, CONT'D), but use its scene and action details in the visuals, sound and music around their words.
		- What they said about the look, mood, pacing or delivery guides the visuals, sound, music and delivery. Never speak it.
		- Everything else in their message is still theirs. A setting they stated outright has its own tool: set_title, update_script_settings, update_video_settings, or edit_script for a character, a voice or the art style. An instruction about the text itself ("make this shorter") is carried out with edit_script after write_script.

		## Writing
		Call write_script once, with the whole script. It replaces the script on the canvas, which fills in as you write. Once the turn's work is done, ask whether they want a review. Review only when they say yes (the review-script skill).
	`,
} as const satisfies Skill;
