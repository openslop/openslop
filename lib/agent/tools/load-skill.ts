import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { BookOpen } from "@/components/ui/icon";
import { SKILL_NAMES, SKILLS } from "../skills/registry";
import { defineTool } from "./define-tool";

export const loadSkill = defineTool({
	description: dedent`
	  Load skills from the Skills list. Load every skill a task needs in one call, before starting it.
	`,
	input: z.object({
		names: z.array(z.enum(SKILL_NAMES)).min(1).describe("Skills to load."),
	}),
	output: z.string(),
	icon: BookOpen,
	label: ({ names }) =>
		names?.length ? `Reading up on ${names.join(", ")}` : "Reading up",
	execute: async ({ names }) =>
		SKILLS.filter(({ name }) => names.includes(name))
			.map(({ name, content }) => `# Skill: ${name}\n\n${content}`)
			.join("\n\n"),
});
