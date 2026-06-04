import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createProjectMetadataPlugin } from "@/lib/connectors/llm/plugins/project-metadata";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { TEMPLATES } from "@/lib/templates/templates";

const template = TEMPLATES.find((t) => t.id === "pov-life");
if (!template) throw new Error("expected pov-life template fixture");

let projectId: string;

const seedStore = () => {
	getProjectStore(projectId).getState().updateMetadata({
		style: template.style,
		narration: template.narration,
		characters: template.characters,
	});
};

beforeEach(() => {
	projectId = crypto.randomUUID();
});

afterEach(() => {
	clearProjectStore(projectId);
});

describe("createProjectMetadataPlugin", () => {
	it("injects style, narration, and characters into systemPrompt", () => {
		seedStore();
		const { beforeGenerate } = createProjectMetadataPlugin(projectId);
		const result = beforeGenerate?.({ prompt: "hi" });
		const sys = (result as { systemPrompt: string }).systemPrompt;
		expect(sys).toContain("# Art Style");
		expect(sys).toContain(template.style);
		expect(sys).toContain("# Narration Voice");
		expect(sys).toContain("# Characters");
	});

	it("prepends preamble before existing systemPrompt", () => {
		seedStore();
		const { beforeGenerate } = createProjectMetadataPlugin(projectId);
		const result = beforeGenerate?.({
			prompt: "hi",
			systemPrompt: "user instructions",
		});
		const sys = (result as { systemPrompt: string }).systemPrompt;
		expect(sys).toContain("user instructions");
		expect(sys.indexOf("# Art Style")).toBeLessThan(
			sys.indexOf("user instructions"),
		);
	});

	it("returns params unchanged when metadata is empty", () => {
		const { beforeGenerate } = createProjectMetadataPlugin(projectId);
		const params = { prompt: "hi", systemPrompt: "keep me" };
		expect(beforeGenerate?.(params)).toBe(params);
	});

	it("preserves other params", () => {
		seedStore();
		const { beforeGenerate } = createProjectMetadataPlugin(projectId);
		const result = beforeGenerate?.({
			prompt: "hello",
			model: "claude",
		}) as Record<string, unknown>;
		expect(result.prompt).toBe("hello");
		expect(result.model).toBe("claude");
	});
});
