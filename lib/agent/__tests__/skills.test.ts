import { describe, expect, it } from "vitest";
import { ProjectDataSchema } from "@/lib/project/store";
import { MOTION_EFFECTS } from "@/lib/render/motion-effect-names";
import { TEMPLATES } from "@/lib/templates/templates";
import { sloppyInstructions } from "../prompt";
import { SKILL_INDEX, SKILLS, type SkillName } from "../skills/registry";
import type { AgentToolContext } from "../tools/context";
import { executeToolCall } from "../tools/registry";

const template = TEMPLATES[0];
if (!template) throw new Error("expected a template fixture");

const skill = (name: SkillName) => {
	const found = SKILLS.find((candidate) => candidate.name === name);
	if (!found) throw new Error(`expected a ${name} skill`);
	return found;
};

const withSettings = (scriptSettings: object) =>
	({
		readProject: () => ProjectDataSchema.parse({ scriptSettings }),
	}) as AgentToolContext;

describe("skills", () => {
	it.each(SKILLS)("$name has a description and content", (skill) => {
		expect(skill.description).not.toBe("");
		expect(skill.content).not.toBe("");
	});

	it("lists every skill in the system prompt", () => {
		const [system] = sloppyInstructions({});

		expect(system?.content).toContain(SKILL_INDEX);
	});

	it("carries the app's own values into a skill", () => {
		expect(skill("osml").content).toContain(MOTION_EFFECTS.join(", "));
	});
});

describe("load_skill", () => {
	it("hands back each skill asked for", async () => {
		const outcome = await executeToolCall(
			{ toolName: "load_skill", input: { names: ["osml", "video-prompts"] } },
			withSettings({}),
		);

		expect(outcome.ok && outcome.output).toBe(
			`# Skill: osml\n\n${skill("osml").content}\n\n# Skill: video-prompts\n\n${skill("video-prompts").content}`,
		);
	});

	it("refuses a skill that does not exist, naming the ones that do", async () => {
		const outcome = await executeToolCall(
			{ toolName: "load_skill", input: { names: ["storytelling"] } },
			withSettings({}),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain('"write-script"');
	});
});

describe("read_script_settings", () => {
	const read = (scriptSettings: object) =>
		executeToolCall(
			{ toolName: "read_script_settings", input: {} },
			withSettings(scriptSettings),
		);

	it("hands a template's guide and example story along with the settings", async () => {
		const outcome = await read({ template: template.id });

		expect(outcome.ok && outcome.output).toMatchObject({
			template: template.id,
			templateGuide: expect.stringContaining(template.exampleText),
		});
	});

	it("gives no guide without a template", async () => {
		const outcome = await read({});

		expect(outcome.ok && outcome.output).toMatchObject({
			templateGuide: undefined,
		});
	});
});
