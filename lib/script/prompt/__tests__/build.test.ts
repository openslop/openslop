import { describe, expect, it } from "vitest";
import { NARRATOR } from "@/lib/canvas/assets";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { ScriptSettingsSchema, type ScriptSettings } from "@/lib/project/types";
import { buildScriptPrompt, scriptRules } from "../build";
import { projectPreamble } from "../project";
import { getTemplate, TEMPLATES } from "@/lib/templates/templates";
import { VIDEO_LENGTH_SPECS } from "@/lib/project/video-length";

const settingsOf = (settings: Partial<ScriptSettings> = {}) =>
	ScriptSettingsSchema.parse(settings);

const lengthOf = (length: "1-3m" | "auto") => settingsOf({ length });

const template = TEMPLATES[0];
if (!template) throw new Error("expected a template fixture");

describe("buildScriptPrompt", () => {
	it("gives a brief the length budget and the format spec, and passes it through", () => {
		const { system, prompt } = buildScriptPrompt([], lengthOf("1-3m"), {
			kind: "brief",
			brief: "a rabbit finds a lantern",
		});

		const { minWords } = VIDEO_LENGTH_SPECS["1-3m"];
		expect(system).toContain(`Write ${minWords} to`);
		expect(system).toContain("The story script must be written");
		expect(prompt).toBe("a rabbit finds a lantern");
	});

	it("orders the length budget ahead of the format spec", () => {
		const { system } = buildScriptPrompt([], lengthOf("1-3m"), {
			kind: "brief",
			brief: "a brief",
		});

		expect(system.indexOf("# Length")).toBeLessThan(
			system.indexOf("The story script must be written"),
		);
	});

	it("holds a brief to the format the user picked, and only then", () => {
		const formatOf = (format: "faceless" | "auto") => settingsOf({ format });
		const brief = { kind: "brief", brief: "a brief" } as const;

		expect(buildScriptPrompt([], formatOf("faceless"), brief).system).toContain(
			"The user picked the Faceless format",
		);
		expect(buildScriptPrompt([], formatOf("auto"), brief).system).not.toContain(
			"The user picked the",
		);
	});

	it("leaves a brief on auto with no budget to write to", () => {
		const { system } = buildScriptPrompt([], lengthOf("auto"), {
			kind: "brief",
			brief: "a brief",
		});

		expect(system).not.toContain("# Length");
	});

	it("adapts a pasted script verbatim, its notes in the guidance, with no budget or template", () => {
		const script = "NARRATOR\nHigh above the sleepy hills.";
		const { system, prompt } = buildScriptPrompt(
			[],
			settingsOf({ template: template.id, length: "1-3m" }),
			{ kind: "adapt", script, notes: "warm and slow, lots of wide shots" },
		);

		expect(prompt).toBe(script);
		expect(system).toContain("script-to-XML converter");
		expect(system).toContain("warm and slow, lots of wide shots");
		expect(system).not.toContain("# Length");
		expect(system).not.toContain(getTemplate(template.id).systemPrompt);
	});

	it("pastiches the project's template and keeps the brief as the topic", () => {
		const { system, prompt } = buildScriptPrompt(
			[],
			settingsOf({ template: template.id }),
			{ kind: "brief", brief: "a barista" },
		);

		expect(system).toContain(getTemplate(template.id).systemPrompt);
		expect(prompt).toContain("<user_input>a barista</user_input>");
		expect(prompt).toContain(getTemplate(template.id).exampleText);
	});

	it("writes from the brief alone when the stored template has left the catalog", () => {
		const source = { kind: "brief", brief: "a barista" } as const;

		expect(
			buildScriptPrompt(
				[],
				settingsOf({ template: "left-the-catalog" }),
				source,
			),
		).toEqual(buildScriptPrompt([], settingsOf(), source));
	});

	it("carries the art style, narrator and characters on the canvas", () => {
		const { system } = buildScriptPrompt(
			[
				asset("asset_style", { text: "muted watercolor" }),
				asset("asset_voice", {
					name: NARRATOR,
					attrs: { gender: "feminine" },
				}),
				asset("asset_avatar", { name: "Lumi", text: "a small grey rabbit" }),
			],
			settingsOf(),
			{ kind: "brief", brief: "a brief" },
		);

		expect(system).toContain("# Art Style");
		expect(system).toContain("muted watercolor");
		expect(system).toContain("# Narration Voice");
		expect(system).toContain("- gender: feminine");
		expect(system).toContain("# Characters");
		expect(system).toContain("a small grey rabbit");
		expect(system).not.toContain(`## ${NARRATOR}`);
	});

	it.each([
		[
			"a character's voice and appearance under their name",
			[
				asset("asset_avatar", { name: "Mira", text: "a freckled girl" }),
				asset("asset_voice", { name: "Mira", attrs: { age: "child" } }),
			],
			"## Mira\n\n- age: child\n- appearance: a freckled girl",
			"# Narration Voice",
		],
		[
			"a voice-only character with their voice and no appearance",
			[asset("asset_voice", { name: "Voice", attrs: { pitch: "low" } })],
			"## Voice\n\n- pitch: low",
			"- appearance:",
		],
		[
			"a character with no voice by their appearance alone",
			[asset("asset_avatar", { name: "Lumi", text: "a small grey rabbit" })],
			"## Lumi\n\n- appearance: a small grey rabbit",
			"# Narration Voice",
		],
	])("lists %s", (_, canvas, listed, absent) => {
		const preamble = projectPreamble(canvas);

		expect(preamble).toContain(listed);
		expect(preamble).not.toContain(absent);
	});

	it("says nothing of a project whose canvas holds no assets", () => {
		expect(projectPreamble([])).toBe("");
	});

	it("hands a review the same rules the writer was given, minus the budget it cannot judge", () => {
		const styled = [asset("asset_style", { text: "muted watercolor" })];
		const rules = scriptRules(styled, settingsOf());

		expect(
			buildScriptPrompt(styled, settingsOf(), {
				kind: "brief",
				brief: "a brief",
			}).system,
		).toContain(rules);
		expect(rules).toContain("The story script must be written");
		expect(rules).toContain("muted watercolor");
		expect(rules).not.toContain("# Length");
	});
});
