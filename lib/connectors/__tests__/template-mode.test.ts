import { describe, expect, it } from "vitest";
import { createTemplateModePlugin } from "@/lib/connectors/llm/plugins/template-mode";
import { TEMPLATES } from "@/lib/templates/templates";

const pickTemplate = (predicate: (id: string) => boolean) => {
	const t = TEMPLATES.find((tmpl) => predicate(tmpl.id));
	if (!t) throw new Error("expected at least one template fixture");
	return t;
};

const realTemplate = pickTemplate((id) => id === "pov-life");

describe("createTemplateModePlugin", () => {
	describe("beforeGenerate", () => {
		it("uses template systemPrompt when none provided", () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = beforeGenerate?.({ prompt: "hi" });
			const sys = (result as { systemPrompt: string }).systemPrompt;
			expect(sys).toContain(realTemplate.systemPrompt);
		});

		it("prepends template systemPrompt before existing systemPrompt", () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = beforeGenerate?.({
				prompt: "hi",
				systemPrompt: "user instructions",
			});
			const sys = (result as { systemPrompt: string }).systemPrompt;
			expect(sys).toContain(realTemplate.systemPrompt);
			expect(sys).toContain("user instructions");
			expect(sys.indexOf(realTemplate.systemPrompt)).toBeLessThan(
				sys.indexOf("user instructions"),
			);
		});

		it("returns params unchanged when templateId is null", () => {
			const { beforeGenerate } = createTemplateModePlugin(undefined);
			const params = { prompt: "hi", systemPrompt: "keep me" };
			expect(beforeGenerate?.(params)).toBe(params);
		});

		it("returns params unchanged when templateId is unknown", () => {
			const { beforeGenerate } = createTemplateModePlugin("does-not-exist");
			const params = { prompt: "hi" };
			expect(beforeGenerate?.(params)).toBe(params);
		});

		it("preserves other params", () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = beforeGenerate?.({
				prompt: "hello",
				model: "claude",
			}) as Record<string, unknown>;
			expect(result.prompt).toBe("hello");
			expect(result.model).toBe("claude");
		});
	});

	describe("transformPrompt", () => {
		const fakeCtx = { gateway: {} } as Parameters<
			NonNullable<
				ReturnType<typeof createTemplateModePlugin>["transformPrompt"]
			>
		>[1];

		it("wraps user prompt with the template's example", async () => {
			const { transformPrompt } = createTemplateModePlugin(realTemplate.id);
			const result = await transformPrompt?.("a tech CEO", fakeCtx);
			expect(result).toContain("a tech CEO");
			expect(result).toContain("Pastiche this story format");
			expect(result).toContain(realTemplate.exampleText.slice(0, 64));
		});

		it("returns prompt unchanged when templateId is null", async () => {
			const { transformPrompt } = createTemplateModePlugin(undefined);
			const result = await transformPrompt?.("anything", fakeCtx);
			expect(result).toBe("anything");
		});

		it("returns prompt unchanged when templateId is unknown", async () => {
			const { transformPrompt } = createTemplateModePlugin("does-not-exist");
			const result = await transformPrompt?.("anything", fakeCtx);
			expect(result).toBe("anything");
		});

		it("throws when gateway context is missing for a real template", async () => {
			const { transformPrompt } = createTemplateModePlugin(realTemplate.id);
			await expect(transformPrompt?.("x")).rejects.toThrow(/gateway context/i);
		});
	});
});
