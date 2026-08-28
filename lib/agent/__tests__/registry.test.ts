import { describe, expect, it, vi } from "vitest";
import type { AgentToolContext } from "../tools/context";
import {
	SCRIPT_TOOLS,
	SLOPPY_TOOLS,
	SNAPSHOT_TOOLS,
	executeToolCall,
} from "../tools/registry";
import {
	MetadataSchema,
	type DeepPartial,
	type Metadata,
} from "@/lib/project/types";
import { CaptionStyleSchema } from "@/lib/video/captionStyle";
import type { RefineOp } from "@/lib/script/refine/types";

const metadata = MetadataSchema.parse({
	title: "Little Red",
	style: "claymation",
	videoSettings: { length: "3-5m" },
	characters: { Red: { appearance: "a girl in a red cloak", age: "child" } },
});

const context = (over: Partial<AgentToolContext> = {}): AgentToolContext => ({
	readScript: () => "<narration>hi</narration>",
	countSpokenWords: () => 1,
	measureElementLengths: () => [],
	generateText: async () => "an outline",
	referenceImages: () => [],
	avatarUrl: () => undefined,
	readMetadata: () => metadata,
	editScript: () => ({ applied: 0, failures: [] }),
	writeScript: async () => {},
	adaptScript: async () => {},
	setMetadata: () => {},
	setCharacter: (name) => ({ name, created: !(name in metadata.characters) }),
	...over,
});

describe("executeToolCall", () => {
	it("hands back the script and the settings around it", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("<narration>hi</narration>");
		expect(outcome.ok && outcome.output).toContain(
			"- Red: a girl in a red cloak (voice: child)",
		);
	});

	it("says the canvas is empty rather than handing back nothing", async () => {
		const outcome = await executeToolCall(
			{ toolName: "read_script", input: {} },
			context({ readScript: () => "  " }),
		);

		expect(outcome.ok && outcome.output).toContain("The canvas is empty.");
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

	it("changes only the settings it was given", async () => {
		const patches: unknown[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_metadata", input: { title: "Moon Cat" } },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches).toEqual([{ title: "Moon Cat" }]);
		expect(outcome).toEqual({ ok: true, output: "Set the title." });
	});

	it("refuses a call that names no setting, rather than writing nothing", async () => {
		const patches: unknown[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_metadata", input: {} },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches).toEqual([]);
		expect(outcome.ok).toBe(false);
	});

	it("maps the narrator's traits onto the voice the project reads in", async () => {
		const patches: unknown[] = [];
		await executeToolCall(
			{ toolName: "set_narrator", input: { age: "child" } },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches).toEqual([{ narration: { age: "child" } }]);
	});

	it("says a character is new, so the model knows its avatar is not drawn", async () => {
		const outcome = await executeToolCall(
			{
				toolName: "set_character",
				input: { name: "Wolf", appearance: "a grey wolf" },
			},
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("Added Wolf");
	});

	it("changes a character the project already knows", async () => {
		const edits: unknown[] = [];
		const outcome = await executeToolCall(
			{
				toolName: "set_character",
				input: { name: "Red", pitch: "high" },
			},
			context({
				setCharacter: (name, patch) => {
					edits.push([name, patch]);
					return { name, created: false };
				},
			}),
		);

		expect(edits).toEqual([["Red", { pitch: "high" }]]);
		expect(outcome).toEqual({ ok: true, output: "Changed Red." });
	});

	it("answers with the name the project settled on, not the one it was asked with", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_character", input: { name: "big bad wolf" } },
			context({
				setCharacter: () => ({ name: "Big Bad Wolf", created: true }),
			}),
		);

		expect(outcome.ok && outcome.output).toContain("Added Big Bad Wolf");
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

	it("says a setting change does not reshape what is already on the canvas", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_video_settings", input: { length: "5-10m" } },
			context(),
		);

		expect(outcome.ok && outcome.output).toContain("5-10m");
		expect(outcome.ok && outcome.output).toContain("next script");
	});

	it("applies a caption preset whole, with overrides on top", async () => {
		const patches: DeepPartial<Metadata>[] = [];
		const outcome = await executeToolCall(
			{
				toolName: "set_caption_style",
				input: {
					preset: "karaoke",
					alignY: "top",
					activeWord: { fill: "#ffe14d" },
				},
			},
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		const style = patches[0]?.videoSettings?.captionStyle;
		expect(style).toMatchObject({
			font: "bangers",
			alignY: "top",
			activeWord: { fill: "#ffe14d", bold: false },
		});
		expect(CaptionStyleSchema.safeParse(style).success).toBe(true);
		expect(outcome.ok && outcome.output).toContain("Karaoke preset");
	});

	it("sends only the caption field it was given, so the rest of the style stands", async () => {
		const patches: DeepPartial<Metadata>[] = [];
		await executeToolCall(
			{ toolName: "set_caption_style", input: { fontSize: 120 } },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches[0]?.videoSettings?.captionStyle).toEqual({ fontSize: 120 });
	});

	it("turns captions off without disturbing their style", async () => {
		const patches: DeepPartial<Metadata>[] = [];
		const outcome = await executeToolCall(
			{ toolName: "set_caption_style", input: { captions: false } },
			context({ setMetadata: (patch) => void patches.push(patch) }),
		);

		expect(patches[0]?.videoSettings).toEqual({
			captions: false,
			captionStyle: {},
		});
		expect(outcome.ok && outcome.output).toContain("captions off");
	});

	it("rejects a caption size the panel could not set either", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_caption_style", input: { fontSize: 400 } },
			context(),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("set_caption_style");
	});

	it("rejects a caption call that names nothing to change", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_caption_style", input: {} },
			context(),
		);

		expect(outcome.ok).toBe(false);
	});

	it("rejects a setting call that changes nothing", async () => {
		const outcome = await executeToolCall(
			{ toolName: "set_video_settings", input: {} },
			context(),
		);

		expect(outcome.ok).toBe(false);
	});

	it("reports the count against the project's word budget", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({ countSpokenWords: () => 700 }),
		);

		// The fixture metadata targets 3-5m: 540 to 900 words.
		expect(outcome.ok && outcome.output).toContain("700 spoken words");
		expect(outcome.ok && outcome.output).toContain("within the target range");
	});

	it("says how far off the count is, so the model knows how much to cut or add", async () => {
		const over = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({ countSpokenWords: () => 1000 }),
		);
		expect(over.ok && over.output).toContain("over by 100 words");

		const under = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({ countSpokenWords: () => 500 }),
		);
		expect(under.ok && under.output).toContain("under by 40 words");
	});

	it("counts without a verdict when the length is auto", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_total_length", input: {} },
			context({
				countSpokenWords: () => 1000,
				readMetadata: () =>
					MetadataSchema.parse({ videoSettings: { length: "auto" } }),
			}),
		);

		expect(outcome.ok && outcome.output).toContain("1000 spoken words");
		expect(outcome.ok && outcome.output).not.toContain("over by");
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
					},
					{
						id: "ai1",
						type: "animated_image",
						sceneNumber: 2,
						seconds: 1,
						words: 0,
						dialogueIds: [],
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			"Scene 1 image img1: 30.0s, from 90 words of dialogue after it (nar1)",
		);
		expect(outcome.ok && outcome.output).toContain(
			"Scene 2 animated_image ai1: 1.0s, nothing after it, so it holds the minimum",
		);
	});

	it("fits each clip to the dialogue under it and says it went stale", async () => {
		const ops: RefineOp[][] = [];
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: {} },
			context({
				measureElementLengths: () => [
					{
						id: "ai1",
						type: "animated_image",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: ["nar1"],
						durationSec: 10,
					},
					{
						id: "img1",
						type: "image",
						sceneNumber: 1,
						seconds: 30,
						words: 90,
						dialogueIds: ["nar2"],
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
			"Scene 1 animated_image ai1: 10s to 5s, for 5.0s of dialogue and leeway.",
		);
		expect(outcome.ok && outcome.output).toContain("need regenerating");
		expect(outcome.ok && outcome.output).toContain("1 image still left alone.");
	});

	it("names a clip whose dialogue outruns the longest option instead of hiding the clamp", async () => {
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: { element_ids: ["clip1"] } },
			context({
				measureElementLengths: () => [
					{
						id: "ai1",
						type: "animated_image",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: [],
						durationSec: 10,
					},
					{
						id: "clip1",
						type: "clip",
						sceneNumber: 2,
						seconds: 60,
						words: 180,
						dialogueIds: ["nar2"],
						durationSec: 15,
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain("Scene 2 clip clip1 needs");
		expect(outcome.ok && outcome.output).toContain("split the dialogue");
		expect(outcome.ok && outcome.output).not.toContain("ai1");
	});

	it("leaves durations alone when every clip already covers its dialogue", async () => {
		const outcome = await executeToolCall(
			{ toolName: "fit_durations", input: { element_ids: ["clip1"] } },
			context({
				measureElementLengths: () => [
					{
						id: "clip1",
						type: "clip",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: ["nar1"],
						durationSec: 5,
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
			{ toolName: "fit_durations", input: { element_ids: ["clip1", "nope"] } },
			context({
				measureElementLengths: () => [
					{
						id: "clip1",
						type: "clip",
						sceneNumber: 1,
						seconds: 4,
						words: 12,
						dialogueIds: ["nar1"],
						durationSec: 5,
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
					},
				],
			}),
		);

		expect(outcome.ok && outcome.output).toContain(
			"No animated_image or clip in scope.",
		);
	});

	it("says the canvas has no visuals rather than reporting an empty table", async () => {
		const outcome = await executeToolCall(
			{ toolName: "measure_element_lengths", input: {} },
			context(),
		);

		expect(outcome.ok && outcome.output).toBe(
			"No visual elements on the canvas yet.",
		);
	});

	it("hands over the reference images for the model to look at", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_reference_images", input: {} },
			context({ referenceImages: () => ["https://example.com/a.jpg"] }),
		);

		expect(outcome.ok && outcome.output).toEqual({
			urls: ["https://example.com/a.jpg"],
		});
	});

	it("says there is nothing to look at rather than handing over an empty set", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_reference_images", input: {} },
			context(),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("No reference images");
	});

	it("hands over a character's avatar by name", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_avatar", input: { name: "Mira" } },
			context({ avatarUrl: () => "https://example.com/mira.png" }),
		);

		expect(outcome.ok && outcome.output).toEqual({
			name: "Mira",
			url: "https://example.com/mira.png",
		});
	});

	it("says an avatar does not exist yet rather than inventing one", async () => {
		const outcome = await executeToolCall(
			{ toolName: "view_avatar", input: { name: "Mira" } },
			context(),
		);

		expect(outcome.ok).toBe(false);
		expect(!outcome.ok && outcome.errorText).toContain("no avatar image yet");
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
});

describe("SLOPPY_TOOLS", () => {
	it("offers the model exactly the tools the editor can run", () => {
		expect(Object.keys(SLOPPY_TOOLS)).toEqual([
			"read_script",
			"edit_script",
			"write_script",
			"adapt_script",
			"set_video_settings",
			"set_caption_style",
			"set_language",
			"view_reference_images",
			"view_avatar",
			"outline_story",
			"measure_total_length",
			"measure_element_lengths",
			"fit_durations",
			"set_metadata",
			"set_narrator",
			"set_character",
		]);
	});

	it("declares no executor, so a step stops at the call for the editor to run", () => {
		for (const tool of Object.values(SLOPPY_TOOLS)) {
			expect(tool.execute).toBeUndefined();
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

describe("tool flags", () => {
	it("collects the tools whose output only lasts the turn", () => {
		expect([...SNAPSHOT_TOOLS].sort()).toEqual([
			"read_script",
			"view_avatar",
			"view_reference_images",
		]);
	});

	it("collects the tools that rewrite the canvas", () => {
		expect([...SCRIPT_TOOLS].sort()).toEqual([
			"adapt_script",
			"edit_script",
			"fit_durations",
			"write_script",
		]);
	});
});
