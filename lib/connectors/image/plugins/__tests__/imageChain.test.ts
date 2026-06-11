import { afterEach, describe, expect, it } from "vitest";
import { buildCharacterAvatarPlugins } from "../imageChain";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";

const PROJECT_ID = "image-chain-test";

afterEach(() => clearProjectStore(PROJECT_ID));

describe("buildCharacterAvatarPlugins", () => {
	it("forwards project referenceImages into avatar generation params", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.setReferenceImages([
				"https://img/style-a.png",
				"https://img/style-b.png",
			]);

		const plugins = buildCharacterAvatarPlugins(
			PROJECT_ID,
			"Alice",
			"A girl",
			"sig",
		);
		const refPlugin = plugins.find((p) => p.name === "reference-images");
		expect(refPlugin).toBeDefined();

		const out = refPlugin?.beforeGenerate?.({ prompt: "ignored" }, {});
		expect(out).toEqual({
			prompt: "ignored",
			referenceImages: ["https://img/style-a.png", "https://img/style-b.png"],
		});
	});
});
