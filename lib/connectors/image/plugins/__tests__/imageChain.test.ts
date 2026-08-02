import { afterEach, describe, expect, it } from "vitest";
import { buildCharacterAvatarPlugins } from "../characterAvatarNode";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { stateCtx } from "@/lib/connectors/__tests__/_state-ctx";

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

		const plugins = buildCharacterAvatarPlugins("Alice");
		const refPlugin = plugins.find(
			(plugin) => plugin.name === "reference-images",
		);
		expect(refPlugin).toBeDefined();

		const out = refPlugin?.beforeGenerate?.(
			{ prompt: "ignored" },
			stateCtx(PROJECT_ID),
		);
		expect(out).toEqual({
			prompt: "ignored",
			referenceImages: ["https://img/style-a.png", "https://img/style-b.png"],
		});
	});
});
