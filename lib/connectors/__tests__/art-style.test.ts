import { beforeEach, describe, expect, it } from "vitest";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/art-style";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

let store: ProjectStore;

beforeEach(() => {
	store = createProjectStore();
});

describe("createArtStylePlugin", () => {
	it("has the expected name", () => {
		expect(createArtStylePlugin().name).toBe("art-style");
	});

	it("prepends metadata.style with period separator when style is set", () => {
		store.getState().updateMetadata({ style: "cinematic anime" });
		const { transformPrompt } = createArtStylePlugin();
		expect(transformPrompt?.("a cat on a roof", stateCtx(store))).toBe(
			"cinematic anime. a cat on a roof",
		);
	});

	it("returns prompt unchanged when style is empty", () => {
		const { transformPrompt } = createArtStylePlugin();
		expect(transformPrompt?.("a cat on a roof", stateCtx(store))).toBe(
			"a cat on a roof",
		);
	});

	it("returns prompt unchanged when style is whitespace-only", () => {
		store.getState().updateMetadata({ style: "   " });
		const { transformPrompt } = createArtStylePlugin();
		expect(transformPrompt?.("a cat on a roof", stateCtx(store))).toBe(
			"a cat on a roof",
		);
	});
});
