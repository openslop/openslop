import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scriptLengthPlugin } from "@/lib/connectors/llm/plugins/script-length";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import {
	DEFAULT_VIDEO_LENGTH,
	VIDEO_LENGTH_SPECS,
} from "@/lib/video/videoLength";
import { stateCtx } from "./_state-ctx";
import type { LLMGenerateParams } from "../types";

const { beforeGenerate } = scriptLengthPlugin;
if (!beforeGenerate)
	throw new Error("scriptLengthPlugin.beforeGenerate is required");

let projectId: string;

const systemPromptFor = (params: LLMGenerateParams): string =>
	(beforeGenerate(params, stateCtx(projectId)) as { systemPrompt: string })
		.systemPrompt;

beforeEach(() => {
	projectId = crypto.randomUUID();
});

afterEach(() => {
	clearProjectStore(projectId);
});

describe("scriptLengthPlugin", () => {
	it("gives the model a spoken word budget for the selected length", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({ videoSettings: { length: "10-15m" } });

		const sys = systemPromptFor({ prompt: "hi" });

		expect(sys).toContain("1800");
		expect(sys).toContain("2700");
	});

	it("never states the runtime, which a model cannot reason about", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({ videoSettings: { length: "10-15m" } });

		expect(systemPromptFor({ prompt: "hi" })).not.toContain(
			VIDEO_LENGTH_SPECS["10-15m"].label,
		);
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
