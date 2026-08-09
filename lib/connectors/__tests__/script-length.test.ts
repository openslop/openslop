import { beforeEach, describe, expect, it } from "vitest";
import { scriptLengthPlugin } from "@/lib/connectors/llm/plugins/script-length";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import {
	DEFAULT_VIDEO_LENGTH,
	VIDEO_LENGTH_SPECS,
} from "@/lib/video/videoLength";
import { stateCtx } from "./_state-ctx";
import type { LLMGenerateParams } from "../types";

const { beforeGenerate } = scriptLengthPlugin;
if (!beforeGenerate)
	throw new Error("scriptLengthPlugin.beforeGenerate is required");

let store: ProjectStore;

const systemPromptFor = (params: LLMGenerateParams): string =>
	(beforeGenerate(params, stateCtx(store)) as { systemPrompt: string })
		.systemPrompt;

beforeEach(() => {
	store = createProjectStore();
});

describe("scriptLengthPlugin", () => {
	it("budgets in words, never the runtime", () => {
		store.getState().updateMetadata({ videoSettings: { length: "10-15m" } });

		const sys = systemPromptFor({ prompt: "hi" });

		expect(sys).toContain("1800");
		expect(sys).toContain("2700");
		expect(sys).not.toContain(VIDEO_LENGTH_SPECS["10-15m"].label);
	});

	it("falls back to the default budget when no length is selected", () => {
		const { minWords } = VIDEO_LENGTH_SPECS[DEFAULT_VIDEO_LENGTH];
		expect(systemPromptFor({ prompt: "hi" })).toContain(String(minWords));
	});

	it("prepends the budget before an existing systemPrompt", () => {
		const sys = systemPromptFor({ prompt: "hi", systemPrompt: "MODE PROMPT" });
		expect(sys.indexOf("# Length")).toBeLessThan(sys.indexOf("MODE PROMPT"));
	});
});
