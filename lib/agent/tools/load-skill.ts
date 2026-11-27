import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { plural } from "@/lib/format";
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
		names?.length
			? `Loading ${names.length} ${plural(names.length, "skill")}`
			: "Loading skills",
	execute: async ({ names }) =>
		SKILLS.filter(({ name }) => names.includes(name))
			.map(({ name, content }) => `# Skill: ${name}\n\n${content}`)
			.join("\n\n"),
});
