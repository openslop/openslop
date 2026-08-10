import { describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/templates";
import { MODE_SPECS, modePlugins } from "../modes";
import { MODES } from "@/lib/project/types";

const namesFor = (mode: (typeof MODES)[number]) =>
	modePlugins(mode, DEFAULT_TEMPLATE_ID).map((plugin) => plugin.name);

describe("modePlugins", () => {
	it("gives each mode its own prompt plugin", () => {
		expect(namesFor("story")).toContain("storyMode");
		expect(namesFor("script")).toContain("scriptMode");
		expect(namesFor("template")).toContain("templateMode");
	});

	it("adds the length plugin to exactly the modes that target a length", () => {
		for (const mode of MODES) {
			expect(namesFor(mode).includes("scriptLength")).toBe(
				MODE_SPECS[mode].targetsLength,
			);
		}
	});
});
