import { describe, expect, it } from "vitest";
import { buildCharacterAvatarPlugins } from "../characterAvatarNode";
import { createProjectStore } from "@/lib/project/store";
import { stateCtx } from "@/lib/connectors/__tests__/_state-ctx";

describe("buildCharacterAvatarPlugins", () => {
	it("forwards project referenceImages into avatar generation params", () => {
		const store = createProjectStore();
		store
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
			stateCtx(store),
		);
		expect(out).toEqual({
			prompt: "ignored",
			referenceImages: ["https://img/style-a.png", "https://img/style-b.png"],
		});
	});
});
