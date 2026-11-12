import { z } from "zod";
import { TEMPLATES } from "./templates";
import povLifeSystem from "./data/pov-life/system-prompt.md?raw";
import povLifeExample from "./data/pov-life/example.md?raw";
import sleepStorySystem from "./data/sleep-story/system-prompt.md?raw";
import sleepStoryExample from "./data/sleep-story/example.md?raw";
import financeTipsSystem from "./data/finance-tips/system-prompt.md?raw";
import financeTipsExample from "./data/finance-tips/example.md?raw";
import trueCrimeSystem from "./data/true-crime/system-prompt.md?raw";
import trueCrimeExample from "./data/true-crime/example.md?raw";
import povFinancialLifestyleSystem from "./data/pov-financial-lifestyle/system-prompt.md?raw";
import povFinancialLifestyleExample from "./data/pov-financial-lifestyle/example.md?raw";
import celebrityDeathSystem from "./data/celebrity-death/system-prompt.md?raw";
import celebrityDeathExample from "./data/celebrity-death/example.md?raw";
import stickExplainerSystem from "./data/stick-explainer/system-prompt.md?raw";
import stickExplainerExample from "./data/stick-explainer/example.md?raw";

const text = z.string().trim().min(1);
const promptSchema = z.strictObject({ systemPrompt: text, exampleText: text });
export type TemplatePrompt = z.infer<typeof promptSchema>;

const data: Record<string, unknown> = {
	"pov-life": { systemPrompt: povLifeSystem, exampleText: povLifeExample },
	"sleep-story": {
		systemPrompt: sleepStorySystem,
		exampleText: sleepStoryExample,
	},
	"finance-tips": {
		systemPrompt: financeTipsSystem,
		exampleText: financeTipsExample,
	},
	"true-crime": {
		systemPrompt: trueCrimeSystem,
		exampleText: trueCrimeExample,
	},
	"pov-financial-lifestyle": {
		systemPrompt: povFinancialLifestyleSystem,
		exampleText: povFinancialLifestyleExample,
	},
	"celebrity-death": {
		systemPrompt: celebrityDeathSystem,
		exampleText: celebrityDeathExample,
	},
	"stick-explainer": {
		systemPrompt: stickExplainerSystem,
		exampleText: stickExplainerExample,
	},
};

const PROMPTS = new Map(
	TEMPLATES.map(({ id }) => [id, promptSchema.parse(data[id])]),
);

export function getTemplatePromptById(
	id: string | undefined,
): TemplatePrompt | undefined {
	return id === undefined ? undefined : PROMPTS.get(id);
}
