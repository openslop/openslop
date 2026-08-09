import { beforeEach, describe, expect, it } from "vitest";
import { projectMetadataPlugin } from "@/lib/connectors/llm/plugins/project-metadata";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";
import { TEMPLATES } from "@/lib/templates/templates";

const template = TEMPLATES.find((t) => t.id === "pov-life");
if (!template) throw new Error("expected pov-life template fixture");

let store: ProjectStore;

const seedStore = () => {
	store.getState().updateMetadata({
		style: template.style?.description,
		narration: template.narration,
		characters: template.characters,
	});
};

beforeEach(() => {
	store = createProjectStore();
});

describe("projectMetadataPlugin", () => {
	it("injects style, narration, and characters into systemPrompt", () => {
		seedStore();
		const { beforeGenerate } = projectMetadataPlugin;
		const result = beforeGenerate?.({ prompt: "hi" }, stateCtx(store));
		const sys = (result as { systemPrompt: string }).systemPrompt;
		expect(sys).toContain("# Art Style");
		expect(sys).toContain(template.style?.description);
		expect(sys).toContain("# Narration Voice");
		expect(sys).toContain("# Characters");
	});

	it("prepends preamble before existing systemPrompt", () => {
		seedStore();
		const { beforeGenerate } = projectMetadataPlugin;
		const result = beforeGenerate?.(
			{ prompt: "hi", systemPrompt: "user instructions" },
			stateCtx(store),
		);
		const sys = (result as { systemPrompt: string }).systemPrompt;
		expect(sys).toContain("user instructions");
		expect(sys.indexOf("# Art Style")).toBeLessThan(
			sys.indexOf("user instructions"),
		);
	});

	it("returns params unchanged when metadata is empty", () => {
		const { beforeGenerate } = projectMetadataPlugin;
		const params = { prompt: "hi", systemPrompt: "keep me" };
		expect(beforeGenerate?.(params, stateCtx(store))).toEqual(params);
	});

	it("preserves other params", () => {
		seedStore();
		const { beforeGenerate } = projectMetadataPlugin;
		const result = beforeGenerate?.(
			{ prompt: "hello", model: "claude" },
			stateCtx(store),
		) as Record<string, unknown>;
		expect(result.prompt).toBe("hello");
		expect(result.model).toBe("claude");
	});
});
