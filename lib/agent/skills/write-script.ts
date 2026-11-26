import { dedent } from "@/lib/dedent";
import type { Skill } from "./registry";

export const writeScript = {
	name: "write-script",
	description:
		"Putting a new script on the canvas with write_script, written from an idea or converted from a script the user wrote (a screenplay, draft, prose, transcript or lyrics): settings, models, title, assets, then the script. Load it with osml, video-formats, video-prompts, music-prompts and assets to start a project, a fresh idea, or whenever the user's message carries a script of their own.",
	content: dedent`
		## Before writing
		1. read_script_settings, then set the format (and, for an idea, the target length) with update_script_settings. Keep anything the user set.
		2. list_models, then set_default_model for each element type the script uses. Keep any default the user set.
		3. Name the project with set_title, unless read_title already has a name.
		4. read_media. If the user uploaded anything, load media-library and use it.
		5. Add the assets the script needs with edit_script (see assets).

		## From an idea
		- If the settings name a template, read it with read_template and copy its style (tone, pacing, imagery, structure, story beats) for the user's topic.
		- For a made-up story with no real plot yet, outline it first: premise, characters, themes, conflict, twists and ending. Skip this if the user gave the plot, a template sets the shape, or it isn't a story.
		- Stay within the word budget for the target length, from update_script_settings. Only spoken words count.

		## From the user's own script
		Convert their text into the format. The target length and templates don't apply.
		- Keep their words EXACTLY, however long. Never summarize, rewrite or shorten, and never change, add or cut dialogue or prose. If you can't tell where the script starts, keep the text.
		- Drop screenplay formatting (scene headings, stage directions, character cues, CONT'D), but use those details in the visuals, sound and music.
		- Notes on look, mood, pacing or delivery shape the visuals, sound, music and delivery. They are never spoken.
		- Apply any setting they state with its tool: set_title, update_script_settings, update_video_settings, or edit_script for a character, voice or art style. Do requests about the text ("make this shorter") with edit_script after write_script.

		## Writing
		Call write_script once with the whole script. When you're done, offer a review.
	`,
} as const satisfies Skill;
