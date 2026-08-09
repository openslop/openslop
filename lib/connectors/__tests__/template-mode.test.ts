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

		it("throws when templateId is unknown", () => {
			const { beforeGenerate } = createTemplateModePlugin("does-not-exist");
			expect(() => beforeGenerate?.({ prompt: "hi" })).toThrow(
				'Unknown template id "does-not-exist"',
			);
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

		it("pastiches the example's form without inheriting its language", async () => {
			const { transformPrompt } = createTemplateModePlugin(realTemplate.id);
			const result = await transformPrompt?.("un PDG de la tech", fakeCtx);
			expect(result).toContain("language of the user_input");
			expect(result).not.toContain("tone, language, pacing");
		});

		it("rejects when templateId is unknown", async () => {
			const { transformPrompt } = createTemplateModePlugin("does-not-exist");
			await expect(transformPrompt?.("anything", fakeCtx)).rejects.toThrow(
				'Unknown template id "does-not-exist"',
			);
		});
	});
});
