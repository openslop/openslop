import { describe, expect, it } from "vitest";
import { createTemplateModePlugin } from "@/lib/connectors/llm/plugins/template-mode";
import { getTemplatePrompt } from "@/lib/templates/prompts";
import { TEMPLATES } from "@/lib/templates/templates";

const pickTemplate = (predicate: (id: string) => boolean) => {
	const t = TEMPLATES.find((tmpl) => predicate(tmpl.id));
	if (!t) throw new Error("expected at least one template fixture");
	return t;
};

const realTemplate = pickTemplate((id) => id === "pov-life");
const realPrompt = getTemplatePrompt(realTemplate.id);

describe("createTemplateModePlugin", () => {
	describe("beforeGenerate", () => {
		it("uses template systemPrompt when none provided", async () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = await beforeGenerate?.({ prompt: "hi" });
			const sys = (result as { systemPrompt: string }).systemPrompt;
			expect(sys).toContain(realPrompt.systemPrompt);
		});

		it("prepends template systemPrompt before existing systemPrompt", async () => {
			const { beforeGenerate } = createTemplateModePlugin(realTemplate.id);
			const result = await beforeGenerate?.({
				prompt: "hi",
				systemPrompt: "user instructions",
			});
			const sys = (result as { systemPrompt: string }).systemPrompt;
			expect(sys).toContain(realPrompt.systemPrompt);
			expect(sys).toContain("user instructions");
			expect(sys.indexOf(realPrompt.systemPrompt)).toBeLessThan(
				sys.indexOf("user instructions"),
			);
		});

		it("rejects when templateId is unknown", async () => {
			const { beforeGenerate } = createTemplateModePlugin("does-not-exist");
			await expect(beforeGenerate?.({ prompt: "hi" })).rejects.toThrow(
				'Unknown template id "does-not-exist"',
			);
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
			expect(result).toContain(realPrompt.exampleText.slice(0, 64));
		});

		it("rejects when templateId is unknown", async () => {
			const { transformPrompt } = createTemplateModePlugin("does-not-exist");
			await expect(transformPrompt?.("anything", fakeCtx)).rejects.toThrow(
				'Unknown template id "does-not-exist"',
			);
		});
	});
});
