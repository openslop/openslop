import { describe, expect, it } from "vitest";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { removeComposerCharacter } from "../ComposerAssets";

describe("removeComposerCharacter", () => {
	it("removes the selected character without changing other composer assets", () => {
		const projectId = "composer-assets-remove-character";
		const store = getProjectStore(projectId);
		store.getState().setCharacter("Alice", { appearance: "red hair" });
		store.getState().setCharacter("Bob", { appearance: "blue coat" });
		store.getState().setReferenceImages(["ref-a.png"]);

		removeComposerCharacter(projectId, "Alice");

		expect(store.getState().metadata.characters).toEqual({
			Bob: { appearance: "blue coat" },
		});
		expect(store.getState().referenceImages).toEqual(["ref-a.png"]);

		clearProjectStore(projectId);
	});
});
