import { describe, expect, it } from "vitest";
import { DEFAULT_MODELS, listModels } from "@/lib/connectors/models";
import { ProjectDataSchema } from "@/lib/project/store";
import { promptSkillFor } from "../skills/model-skills";
import { MODEL_PROMPT_SKILLS, SKILL_INDEX } from "../skills/registry";
import type { AgentToolContext } from "../tools/context";
import { executeToolCall } from "../tools/registry";

const context = {
	readProject: () => ProjectDataSchema.parse({ scriptSettings: {} }),
} as AgentToolContext;

const readAttributes = (type: string, provider: string, model: string) =>
	executeToolCall(
		{ toolName: "read_model_attributes", input: { type, provider, model } },
		context,
	);

describe("promptSkillFor", () => {
	it("gives every voice and video model a prompting skill", () => {
		for (const type of ["tts", "video"] as const) {
			for (const { provider, model } of listModels(type)) {
				expect(promptSkillFor(type, { provider, model })).toBeDefined();
			}
		}
	});

	it("covers the default voice and video models", () => {
		expect(promptSkillFor("tts", DEFAULT_MODELS.tts)).toBe("cartesia-sonic");
		expect(promptSkillFor("video", DEFAULT_MODELS.video)).toBe("kling-omni");
	});

	it("tells Kling Omni and Seedance apart", () => {
		expect(
			promptSkillFor("video", { provider: "runware", model: "Kling 4 Omni" }),
		).toBe("kling-omni");
		expect(
			promptSkillFor("video", { provider: "runware", model: "Seedance 2.5" }),
		).toBe("seedance");
	});

	it("gives a model OpenSlop hosts its vendor's skill", () => {
		expect(
			promptSkillFor("video", {
				provider: "openslop",
				model: "Seedance 2 Fast",
			}),
		).toBe(
			promptSkillFor("video", {
				provider: "runware",
				model: "Seedance 2 Fast",
			}),
		);
	});

	it("has none for a model with no skill of its own", () => {
		expect(promptSkillFor("image", DEFAULT_MODELS.image)).toBeUndefined();
	});
});

describe("model prompting skills", () => {
	it("stay out of the system prompt's skill index", () => {
		for (const { name } of MODEL_PROMPT_SKILLS) {
			expect(SKILL_INDEX).not.toContain(`- ${name}:`);
		}
	});

	it("load through load_skill like any other", async () => {
		const outcome = await executeToolCall(
			{ toolName: "load_skill", input: { names: ["seedance"] } },
			context,
		);

		expect(outcome.ok && outcome.output).toContain("# Skill: seedance");
	});
});

describe("read_model_attributes", () => {
	it("names the skill for the model in play", async () => {
		const { provider, model } = DEFAULT_MODELS.video;
		const outcome = await readAttributes("video", provider, model);

		expect(outcome.ok && outcome.output).toContain("load the kling-omni skill");
		expect(outcome.ok && outcome.output).not.toContain("seedance");
	});

	it("names the voice model's skill for speech", async () => {
		const { provider, model } = DEFAULT_MODELS.tts;
		const outcome = await readAttributes("speech", provider, model);

		expect(outcome.ok && outcome.output).toContain(
			"load the cartesia-sonic skill",
		);
	});

	it("names no skill for a model without one", async () => {
		const { provider, model } = DEFAULT_MODELS.image;
		const outcome = await readAttributes("image", provider, model);

		expect(outcome.ok && outcome.output).not.toContain("skill");
	});
});
