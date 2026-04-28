import { describe, expect, it } from "vitest";
import { createTemplateModePlugin } from "../plugins/template-mode";
import { TEMPLATES } from "@/lib/templates/templates";
import { getTemplateContent } from "@/lib/templates/content";

const pickTemplate = (predicate: (id: string) => boolean) => {
	const t = TEMPLATES.find((tmpl) => predicate(tmpl.id));
	if (!t) throw new Error("expected at least one template fixture");
	const content = getTemplateContent(t.id);
	if (!content) throw new Error("expected template content fixture");
	return { ...t, ...content };
};

const realTemplate = pickTemplate((id) => id === "pov-life");

describe("createTemplateModePlugin", () => {
	describe("beforeGenerate", () => {
		it("prepends template systemPrompt when none provided", async () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = await beforeGenerate?.({ prompt: "hi" });
			const sys = (result as { systemPrompt: string }).systemPrompt;
			expect(sys).toBe(realTemplate.systemPrompt);
		});

		it("prepends template systemPrompt before existing systemPrompt", async () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = await beforeGenerate?.({
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

		it("returns params unchanged when templateId is null", async () => {
			const { beforeGenerate } = createTemplateModePlugin(null);
			const params = { prompt: "hi", systemPrompt: "keep me" };
			expect(await beforeGenerate?.(params)).toBe(params);
		});

		it("returns params unchanged when templateId is unknown", async () => {
			const { beforeGenerate } = createTemplateModePlugin("does-not-exist");
			const params = { prompt: "hi" };
			expect(await beforeGenerate?.(params)).toBe(params);
		});

		it("preserves other params", async () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = (await beforeGenerate?.({
				prompt: "hello",
				model: "claude",
			})) as Record<string, unknown>;
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
			const { transformPrompt } = createTemplateModePlugin(null);
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
