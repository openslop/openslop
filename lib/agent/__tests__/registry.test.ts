import { describe, expect, it, vi } from "vitest";
import type { AgentToolContext } from "../tools/context";
import {
	SCRIPT_TOOLS,
	SLOPPY_TOOLS,
	SNAPSHOT_TOOLS,
	executeToolCall,
	presentToolCall,
} from "../tools/registry";
import { ProjectDataSchema } from "@/lib/project/store";
import type { DeepPartial, ScriptSettings } from "@/lib/project/types";
import type { VideoSettings } from "@/lib/project/videoSettings";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import { CaptionStyleSchema } from "@/lib/captions/captionStyle";
import type { RefineOp } from "@/lib/script/refine/types";
import { NO_FINDINGS } from "@/lib/script/prompt/review";

const recordScriptSettings = (patches: Partial<ScriptSettings>[]) => ({
	updateScriptSettings: (patch: Partial<ScriptSettings>) =>
		void patches.push(patch),
});

const recordVideoSettings = (patches: DeepPartial<VideoSettings>[]) => ({
	updateVideoSettings: (patch: DeepPartial<VideoSettings>) =>
		void patches.push(patch),
});

const project = (
	over: { title?: string; scriptSettings?: Partial<ScriptSettings> } = {},
) =>
	ProjectDataSchema.parse({
		title: "Moon Cat",
		scriptSettings: { length: "3-5m" },
		videoSettings: { aspectRatio: "9:16" },
		...over,
	});

const context = (over: Partial<AgentToolContext> = {}): AgentToolContext => ({
	readScript: () => "<narration>hi</narration>",
	countSpokenWords: () => 1,
	measureElementLengths: () => [],
	measureRuntime: () => 0,
	generateText: async () => "an outline",
	elementImage: () => undefined,
	elementStates: () => [],
	readAssets: () => [],
	readProject: () => project(),
	editScript: () => ({ applied: 0, failures: [] }),
	writeScript: async () => {},
	adaptScript: async () => {},
	setTitle: () => {},
	updateVideoSettings: () => {},
	updateScriptSettings: () => {},
	...over,
});

describe("executeToolCall", () => {
	it("hands back the script and the settings it renders with, with no character list beside it", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("- title: Moon Cat");
		expect(outcome.ok && outcome.output).toContain("<narration>hi</narration>");
		expect(outcome.ok && outcome.output).toContain("- length: 3-5m");
		expect(outcome.ok && outcome.output).toContain("- template: none");
		expect(outcome.ok && outcome.output).toContain("- aspect ratio: 9:16");
		expect(outcome.ok && outcome.output).not.toContain("Characters");
	});

	it("says the canvas is empty and the project untitled rather than handing back nothing", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context({
				readScript: () => "  ",
				readProject: () => project({ title: "" }),
			}),
		);

		expect(outcome.ok && outcome.output).toContain("- title: not set");
		expect(outcome.ok && outcome.output).toContain("The canvas is empty.");
		expect(outcome.ok && outcome.output).toContain(
			"## Generation state\nNone yet.",
		);
	});

	it("reports where each element's generation stands under the script", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context({
				elementStates: () => [
					{ id: "n1", state: "generated" },
					{
						id: "img1",
						state: "stale",
						detail: "The prompt changed — regenerate to update",
					},
					{ id: "ai1", state: "failed", detail: "Provider returned 503" },
					{ id: "vid1", state: "ungenerated" },
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			[
				"## Generation state",
				"- n1: generated",
				"- img1: stale (The prompt changed — regenerate to update)",
				"- ai1: failed (Provider returned 503)",
				"- vid1: ungenerated",
			].join("\n"),
		);
	});

	it("reports what an edit could not apply, so the model can fix the call", async () => {
		const outcome = await executeToolCall(
			{ toolName: "edit_script", input: { ops: [{ op: "remove", id: "n1" }] } },
			context({
				editScript: () => ({ applied: 0, failures: ["no element n1"] }),
			}),
		);

		expect(outcome).toMatchObject({ ok: true });
		expect(outcome.ok && outcome.output).toContain("no element n1");
	});

	it("reports a throwing tool rather than losing the turn to it", async () => {
		const outcome = await executeToolCall(
			{ toolName: "write_script", input: { brief: "a new story" } },
			context({
				writeScript: vi.fn(async () => {
					throw new Error("the stream died");
				}),
			}),
		);

		expect(outcome).toEqual({ ok: false, errorText: "the stream died" });
	});

	it("reports a call it cannot read rather than running the wrong tool", async () => {
		const outcome = await executeToolCall(
			{ toolName: "edit_script", input: { brief: "not ops" } },
			context(),
		);

		expect(outcome.ok).toBe(false);
	});

	it("set_title writes the title", async () => {
		const titles: string[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_title", input: { title: "Moon Cat" } },
			context({ setTitle: (title) => void titles.push(title) }),
		);

		expect(titles).toEqual(["Moon Cat"]);
		expect(outcome.ok).toBe(true);
	});

	it("refuses a call that names no title, rather than writing nothing", async () => {
		const titles: string[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_title", input: {} },
			context({ setTitle: (title) => void titles.push(title) }),
		);

		expect(titles).toEqual([]);
		expect(outcome.ok).toBe(false);
	});

	it("puts the user's own script on the canvas untouched", async () => {
		const script = "NARRATOR\nHigh above the sleepy hills.";
		const adapted: string[] = [];

		const outcome = await executeToolCall(
			{ toolName: "adapt_script", input: { script } },
			context({
				adaptScript: async (text) => {
					adapted.push(text);
				},
			}),
		);

		expect(adapted).toEqual([script]);
		expect(outcome.ok).toBe(true);
	});

	it("update_script_settings writes only the settings it was given, and says they shape the next script", async () => {
		const settings: Partial<ScriptSettings>[] = [];
		const outcome = await executeToolCall(
			{
				toolName: "update_script_settings",
				input: { language: "es", length: "5-10m" },
			},
			context(recordScriptSettings(settings)),
		);

		expect(settings).toStrictEqual([{ language: "es", length: "5-10m" }]);
		expect(outcome.ok && outcome.output).toContain("next script");
	});

	it("update_video_settings writes the aspect ratio and transition it was given", async () => {
		const patches: DeepPartial<VideoSettings>[] = [];
		await executeToolCall(
			{
				toolName: "update_video_settings",
				input: { aspectRatio: "9:16", transitionType: "fade" },
			},
			context(recordVideoSettings(patches)),
		);

		expect(patches).toEqual([{ aspectRatio: "9:16", transitionType: "fade" }]);
	});

	it("applies a caption preset whole, with a caption style on top", async () => {
		const patches: DeepPartial<VideoSettings>[] = [];
		const outcome = await executeToolCall(
			{
				toolName: "update_video_settings",
				input: {
					captionPreset: "karaoke",
					captionStyle: { alignY: "top", activeWord: { fill: "#ffe14d" } },
				},
			},
			context(recordVideoSettings(patches)),
		);

		const style = patches[0]?.captionStyle;
		expect(style).toMatchObject({
			font: "bangers",
			alignY: "top",
			activeWord: { fill: "#ffe14d", bold: false },
		});
		expect(CaptionStyleSchema.safeParse(style).success).toBe(true);
		expect(outcome.ok && outcome.output).toContain("Karaoke caption preset");
	});

	it("sends only the caption field it was given, so the rest of the style stands", async () => {
		const patches: DeepPartial<VideoSettings>[] = [];
		await executeToolCall(
			{
				toolName: "update_video_settings",
				input: { captionStyle: { fontSize: 120 } },
			},
			context(recordVideoSettings(patches)),
		);

		expect(patches[0]?.captionStyle).toEqual({ fontSize: 120 });
	});

	it("turns captions off without disturbing their style", async () => {
		const patches: DeepPartial<VideoSettings>[] = [];
		await executeToolCall(
			{ toolName: "update_video_settings", input: { captions: false } },
			context(recordVideoSettings(patches)),
		);

		expect(patches[0]).toEqual({ captions: false });
	});

	it("rejects a caption size the panel could not set either", async () => {
		const outcome = await executeToolCall(
			{
				toolName: "update_video_settings",
				input: { captionStyle: { fontSize: 400 } },
			},
			context(),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("update_video_settings");
	});

	it.each(["update_script_settings", "update_video_settings"])(
		"%s rejects a call that changes nothing",
		async (toolName) => {
			const outcome = await executeToolCall({ toolName, input: {} }, context());

			expect(outcome.ok).toBe(false);
		},
	);

	it("reports the runtime against the project's target length", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({
				countSpokenWords: () => 700,
				measureRuntime: () => 240,
			}),
		);

		// The fixture project targets 3-5m: 180s to 300s.
		expect(outcome.ok && outcome.output).toContain("240.0s of video");
		expect(outcome.ok && outcome.output).toContain("700 spoken words");
		expect(outcome.ok && outcome.output).toContain("within the target range");
	});

	it("says how far off the runtime is, so the model knows how much to cut or add", async () => {
		const over = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({ measureRuntime: () => 400 }),
		);
		expect(over.ok && over.output).toContain("over by 100.0s");

		const under = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({ measureRuntime: () => 100 }),
		);
		expect(under.ok && under.output).toContain("under by 80.0s");
	});

	it("measures without a verdict when the length is auto", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({
				countSpokenWords: () => 1000,
				measureRuntime: () => 600,
				readProject: () => project({ scriptSettings: { length: "auto" } }),
			}),
		);

		expect(outcome.ok && outcome.output).toContain("1000 spoken words");
		expect(outcome.ok && outcome.output).not.toContain("over by");
	});

	const onScreen = (id: string, seconds: number) => ({
		id,
		type: "video" as const,
		sceneNumber: 1,
		seconds,
		words: 0,
		dialogueIds: [],
		durationSec: seconds,
		trimToDialogue: false,
		decidedBy: "duration" as const,
	});

	it("reports what each visual is on screen for, and the dialogue holding it", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_element_lengths", input: {} },
			context({
				measureElementLengths: () => [
					{
						id: "img1",
						type: "image",
						sceneNumber: 1,
						seconds: 30,
						words: 90,
						dialogueIds: ["nar1"],
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
					{
						id: "ai1",
						type: "video",
						sceneNumber: 2,
						seconds: 1,
						words: 0,
						dialogueIds: [],
						trimToDialogue: true,
						decidedBy: "minimum",
					},
					{
						id: "img2",
						type: "image",
						sceneNumber: 3,
						seconds: 1,
						words: 2,
						dialogueIds: ["nar2"],
						trimToDialogue: true,
						decidedBy: "minimum",
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			"Scene 1 image img1: 30.0s, 90 words of dialogue (nar1) after it.",
		);
		expect(outcome.ok && outcome.output).toContain(
			"Scene 2 video ai1: 1.0s, the minimum, no dialogue after it.",
		);
		expect(outcome.ok && outcome.output).toContain(
			"Scene 3 image img2: 1.0s, the minimum, longer than the 2 words of dialogue (nar2) after it.",
		);
	});

	it("says when an untrimmed video's own duration sets its length", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_element_lengths", input: {} },
			context({
				measureElementLengths: () => [
					{
						...onScreen("v1", 8),
						words: 6,
						dialogueIds: ["nar1"],
					},
					onScreen("v2", 5),
					{
						...onScreen("v3", 30),
						durationSec: 5,
						words: 90,
						dialogueIds: ["nar2"],
						decidedBy: "dialogue",
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			"Scene 1 video v1: 8.0s, its full duration, untrimmed; 6 words of dialogue (nar1) after it.",
		);
		expect(outcome.ok && outcome.output).toContain(
			"Scene 1 video v2: 5.0s, its full duration, untrimmed; no dialogue after it.",
		);
		expect(outcome.ok && outcome.output).toContain(
			"Scene 1 video v3: 30.0s, 90 words of dialogue (nar2) after it, longer than its 5.0s duration.",
		);
	});

	it("fits each video element to the dialogue under it and says it went stale", async () => {
		const ops: RefineOp[][] = [];
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: {} },
			context({
				measureElementLengths: () => [
					{
						id: "ai1",
						type: "video",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: ["nar1"],
						durationSec: 10,
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
					{
						id: "img1",
						type: "image",
						sceneNumber: 1,
						seconds: 30,
						words: 90,
						dialogueIds: ["nar2"],
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
				],
				editScript: (applied) => {
					ops.push(applied);
					return { applied: applied.length, failures: [] };
				},
			}),
		);

		expect(ops).toEqual([[{ op: "set", id: "ai1", attrs: { duration: "5" } }]]);
		expect(outcome.ok && outcome.output).toContain(
			"Scene 1 video ai1: 10s to 5s, for 5.0s of dialogue and leeway.",
		);
		expect(outcome.ok && outcome.output).toContain("need regenerating");
		expect(outcome.ok && outcome.output).toContain(
			"1 image or untrimmed video left alone.",
		);
	});

	it("names a video element whose dialogue outruns the longest option instead of hiding the clamp", async () => {
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: { element_ids: ["vid1"] } },
			context({
				measureElementLengths: () => [
					{
						id: "ai1",
						type: "video",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: [],
						durationSec: 10,
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
					{
						id: "vid1",
						type: "video",
						sceneNumber: 2,
						seconds: 60,
						words: 180,
						dialogueIds: ["nar2"],
						durationSec: 15,
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain("Scene 2 video vid1 needs");
		expect(outcome.ok && outcome.output).toContain("split the dialogue");
		expect(outcome.ok && outcome.output).not.toContain("ai1");
		expect(outcome.ok && outcome.output).not.toContain("already cover");
	});

	it("leaves durations alone when every video element already covers its dialogue", async () => {
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: { element_ids: ["vid1"] } },
			context({
				measureElementLengths: () => [
					{
						id: "vid1",
						type: "video",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: ["nar1"],
						durationSec: 5,
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
				],
				editScript: () => {
					throw new Error("nothing to apply");
				},
			}),
		);

		expect(outcome.ok && outcome.output).toContain("nothing to change");
	});

	it("names element_ids that match no visual instead of reporting a clean pass", async () => {
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: { element_ids: ["vid1", "nope"] } },
			context({
				measureElementLengths: () => [
					{
						id: "vid1",
						type: "video",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: ["nar1"],
						durationSec: 5,
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			"Not a visual on the canvas: nope.",
		);
	});

	it("says there is nothing to fit when only stills are in scope", async () => {
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: {} },
			context({
				measureElementLengths: () => [
					{
						id: "img1",
						type: "image",
						sceneNumber: 1,
						seconds: 30,
						words: 90,
						dialogueIds: ["nar1"],
						trimToDialogue: true,
						decidedBy: "dialogue",
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			"No video elements trimmed to dialogue in scope.",
		);
	});

	it("says the canvas has no visuals rather than reporting an empty table", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_element_lengths", input: {} },
			context(),
		);

		expect(outcome.ok && outcome.output).toBe(
			"No images or videos on the canvas yet.",
		);
	});

	it.each([
		["a generated image", "img-1", "image"],
		[
			"a character's avatar through their avatar asset",
			"asset_avatar:Ada",
			"asset_avatar",
		],
		["every uploaded reference image", "asset_references", "asset_references"],
	] as const)("hands over %s with its prompt", async (_, id, type) => {
		const urls = ["https://example.com/a.jpg", "https://example.com/b.jpg"];
		const outcome = await executeToolCall(
			{ toolName: "view_image", input: { id } },
			context({
				elementImage: (asked) =>
					asked === id
						? { type, prompt: "a wolf", pictures: { status: "idle", urls } }
						: undefined,
			}),
		);

		expect(outcome.ok && outcome.output).toEqual({
			id,
			prompt: "a wolf",
			urls,
		});
	});

	it.each([
		[
			"an avatar not drawn yet",
			"asset_avatar",
			"idle",
			"has not been generated yet",
		],
		["an image still generating", "image", "generating", "is still generating"],
		[
			"an asset that holds no picture",
			"asset_style",
			undefined,
			"is of type asset_style",
		],
		[
			"an element that generates no picture",
			"video",
			undefined,
			"is of type video",
		],
	] as const)("refuses %s", async (_, type, status, error) => {
		const outcome = await executeToolCall(
			{ toolName: "view_image", input: { id: "x" } },
			context({
				elementImage: () => ({
					type,
					prompt: "",
					pictures: status && { status, urls: [] },
				}),
			}),
		);

		expect(!outcome.ok && outcome.errorText).toContain(error);
	});

	it("says an element id is not on the canvas rather than inventing a result", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_image", input: { id: "nope" } },
			context(),
		);

		expect(!outcome.ok && outcome.errorText).toContain("no element nope");
	});

	it("outlines a brief through one focused generation", async () => {
		const prompts: string[] = [];
		const outcome = await executeToolCall(
			{ toolName: "outline_story", input: { brief: "a rabbit on the moon" } },
			context({
				generateText: async (prompt) => {
					prompts.push(prompt);
					return "1. A rabbit finds a lantern.";
				},
			}),
		);

		expect(outcome.ok && outcome.output).toBe("1. A rabbit finds a lantern.");
		expect(prompts[0]).toContain("a rabbit on the moon");
		expect(prompts[0]).toContain("conflict, twists, and a resolution");
	});

	it("reviews the script against the rules it was written to", async () => {
		const calls: { prompt: string; systemPrompt?: string }[] = [];
		const outcome = await executeToolCall(
			{ toolName: "review_script", input: { format: "Cinematic" } },
			context({
				generateText: async (prompt, options) => {
					calls.push({ prompt, systemPrompt: options?.systemPrompt });
					return NO_FINDINGS;
				},
			}),
		);

		expect(outcome.ok && outcome.output).toBe(NO_FINDINGS);
		expect(calls[0]?.prompt).toContain("<narration>hi</narration>");
		expect(calls[0]?.prompt).toContain("intended as a Cinematic");
		expect(calls[0]?.systemPrompt).toContain(
			"The story script must be written",
		);
	});

	it("sets no token ceiling, so thinking cannot crowd out the findings", async () => {
		const budgets: (number | undefined)[] = [];
		await executeToolCall(
			{ toolName: "review_script", input: {} },
			context({
				generateText: async (_prompt, options) => {
					budgets.push(options?.maxTokens);
					return NO_FINDINGS;
				},
			}),
		);

		expect(budgets[0]).toBeUndefined();
	});

	it("spends no generation reviewing an empty canvas", async () => {
		const outcome = await executeToolCall(
			{ toolName: "review_script", input: {} },
			context({
				readScript: () => "  ",
				generateText: async () => {
					throw new Error("reviewed an empty canvas");
				},
			}),
		);

		expect(outcome.ok && outcome.output).toContain("nothing to review");
	});
});

describe("SLOPPY_TOOLS", () => {
	it("offers the model exactly the tools the editor can run", () => {
		expect(Object.keys(SLOPPY_TOOLS)).toEqual([
			"read_script",
			"edit_script",
			"write_script",
			"adapt_script",
			"review_script",
			"update_script_settings",
			"update_video_settings",
			"view_image",
			"outline_story",
			"measure_total_length",
			"measure_element_lengths",
			"fit_durations",
			"set_title",
		]);
	});

	it("lists each asset type an edit can set up, and a character's voice traits with their options", () => {
		const { description } = SLOPPY_TOOLS.edit_script;

		for (const type of [
			"asset_avatar",
			"asset_voice",
			"asset_style",
			"asset_references",
		]) {
			expect(description).toContain(`- ${type}: `);
		}
		for (const options of [
			TTS_GENDERS,
			TTS_AGES,
			TTS_PITCHES,
			TTS_ACCENTS,
			TTS_LANGUAGES,
		]) {
			expect(description).toContain(`(${options.join(" | ")})`);
		}
	});
});

describe("a call the editor cannot run", () => {
	it("rejects a call carrying another tool's input", async () => {
		const outcome = await executeToolCall(
			{ toolName: "write_script", input: { ops: [] } },
			context(),
		);

		expect(outcome.ok).toBe(false);
	});

	it("rejects a tool nothing can run", async () => {
		const outcome = await executeToolCall(
			{ toolName: "render_video", input: {} },
			context(),
		);

		expect(outcome).toEqual({
			ok: false,
			errorText: "render_video is not a tool.",
		});
	});
});

describe("presentToolCall", () => {
	it("presents a call to a tool the editor can run", () => {
		expect(presentToolCall("set_title", { title: "Moon Cat" })).toMatchObject({
			label: "Naming the project",
		});
	});

	it.each([
		"set_metadata",
		"set_character",
		"set_narrator",
		"view_avatar",
		"view_reference_images",
	])(
		"presents nothing for %s, which a stored transcript still holds",
		(name) => {
			expect(presentToolCall(name, { name: "Red" })).toBeNull();
		},
	);
});

describe("tool flags", () => {
	it("collects the tools whose output only lasts the turn", () => {
		expect([...SNAPSHOT_TOOLS].sort()).toEqual([
			"read_script",
			"review_script",
			"view_image",
		]);
	});

	it("collects the tools that write the script, reviewing it included", () => {
		expect([...SCRIPT_TOOLS].sort()).toEqual([
			"adapt_script",
			"edit_script",
			"fit_durations",
			"review_script",
			"write_script",
		]);
	});
});
