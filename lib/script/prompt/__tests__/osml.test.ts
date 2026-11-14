import { describe, expect, it } from "vitest";
import { attributeSchemaFor } from "@/lib/canvas/element-connector";
import { ContentTypeSchema } from "@/lib/canvas/types";
import { INPUT_LANGUAGE } from "../language";
import { osmlSpec } from "../osml";

const spec = osmlSpec(INPUT_LANGUAGE);

/** Attributes the writer never sets on a first draft: the model, the mix, the trims and per-element overrides. */
const WRITER_SKIPS = new Set([
	"provider",
	"model",
	"volume",
	"trimStart",
	"trimEnd",
	"format",
	"referenceImagesOverride",
	"uploadedFrame",
]);

describe("osmlSpec", () => {
	it("pins the no-all-caps TTS rule", () => {
		expect(spec).toContain("ALL CAPS");
	});

	it("writes spoken text in the user's language while pinning prompts to English", () => {
		expect(spec).toContain("the language of the user's own topic");
		expect(spec).toMatch(/prompts in English/);
	});

	it("names English as the fallback rather than ruling any language out", () => {
		expect(spec).toContain("or English when that is unclear");
		expect(spec).not.toMatch(/ignoring the language of|not the language of/);
	});

	it("pins the script to the project language when one is declared", () => {
		const declared = osmlSpec("fr (ISO 639-1)");
		expect(declared).toContain("The script language is fr (ISO 639-1)");
		expect(declared).not.toContain("the language of the user's own topic");
	});

	it("asks for the story alone, since the assets are already on the canvas", () => {
		expect(spec).toContain("Write the story and nothing else");
	});

	it("ties each image to the moment its narration describes without dropping the standalone-prompt rule", () => {
		expect(spec).toContain(
			"Depict the specific moment described by the narration and dialogue that follow it",
		);
		expect(spec).toContain("<image> prompt must stand alone");
		expect(spec).toContain(
			"Write each character in an <image> or <video> prompt as {{Name}}",
		);
	});

	it("names the loop counts an element keeps, for sound and for music", () => {
		const allowed = "Allowed values: 1, 2, 3, 4, 5, 6, 7, 8.";
		expect(spec).toContain(`${allowed} Use more for a sound`);
		expect(spec).toContain(
			`${allowed} A cue written to its runtime plays once`,
		);
	});

	it("writes a Cinematic music cue for the scenes it scores, timed to the picture", () => {
		expect(spec).toContain("## Music prompts");
		expect(spec).toContain("In Cinematic the score carries the story");
		expect(spec).toContain("Estimated runtime, as m:ss");
		expect(spec).toContain("each turn timestamped to what is on screen");
		expect(spec).toContain(
			"In Faceless and Explainer the music sits under speech",
		);
	});

	it("takes a cue's runtime from the prompt, with no length attribute to disagree with it", () => {
		expect(spec).toContain("takes its length from it");
		expect(spec).toContain("3 words a second");
		expect(spec).not.toMatch(/\blength: /);
	});

	it("starts a cue with the scene it scores and changes cues at the story's turns", () => {
		expect(spec).toContain("Place it ahead of the first visual it plays under");
		expect(spec).toContain("Change cues where the story turns");
	});

	it("sets the visual cadence without dictating what the script opens with", () => {
		expect(spec).toContain(
			"a new visual (image or video) at least once before every sentence",
		);
		expect(spec).not.toContain("Start with a visual");
	});

	it("describes every video prompt in detail, standing alone", () => {
		expect(spec).toContain("Each prompt is standalone");
	});

	it("asks for one to three labelled shots, varied to suit the moment", () => {
		expect(spec).toContain("one to three numbered shots");
		expect(spec).toContain("even when there is only one");
		expect(spec).toContain("Vary the shot count");
		expect(spec).not.toContain("do not pass in a label");
	});

	it("mixes videos that start fresh with videos that continue the one before", () => {
		expect(spec).toContain('startFrame="none" starts a video fresh');
		expect(spec).toContain("Use both appropriately");
	});

	it("makes a fresh look the default and carries the previous visual only when requested", () => {
		expect(spec).toContain('continuity="false" gives each video a fresh look');
		expect(spec).toContain(
			'continuity="true" shows it the visual before it (an image, or the beginning and middle frames of a video)',
		);
		expect(spec).toContain('The default is "false"');
	});

	it("opens a continued video on the visual before it, an image included", () => {
		expect(spec).toContain(
			"starts exactly on the visual before it: that image, or the end of that video's last shot.",
		);
		expect(spec).not.toContain(
			"starts exactly where that video's last shot ends",
		);
	});

	it("keeps a film to videos and music, whatever the other element rules say", () => {
		expect(spec).toContain(
			"Cinematic: characters speak on screen, inside the video prompts. Only <video> and <music>",
		);
		expect(spec).toContain("The format decides which elements you write.");
	});

	it("teaches every attribute the writer can set, or lists it as one it skips", () => {
		const untaught = ContentTypeSchema.options.flatMap((type) =>
			attributeSchemaFor(type)
				.baseDefs.map(({ key }) => key)
				.filter(
					(key) =>
						!WRITER_SKIPS.has(key) &&
						!new RegExp(`\\b${key}(=|: | \\()`).test(spec),
				)
				.map((key) => `${type}.${key}`),
		);
		expect(untaught).toEqual([]);
	});

	it("sings a music cue only when the story calls for a song, with its lyrics in the prompt", () => {
		expect(spec).toContain(
			'lyrics: "true" makes the cue a song, sung over the scenes (default "false", instrumental)',
		);
		expect(spec).toContain("never under narration or dialogue");
		expect(spec).toContain(
			'Instrumental with no lyrics, unless lyrics="true": then the vocal style too, and the prompt ends with Lyrics:',
		);
		expect(spec).toContain(
			"Only speech quoted inside a <video> prompt and the lyrics of a <music> prompt are in the script language.",
		);
	});

	it("deters motion on video, which competes with the motion the video model generates", () => {
		expect(spec).toMatch(/motion: normally set to "none"/);
		expect(spec).not.toMatch(/<video[^>]*\smotion=/);
	});
});
