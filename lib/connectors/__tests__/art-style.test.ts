import { afterEach, describe, expect, it } from "vitest";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/art-style";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import { stateCtx } from "./_state-ctx";

const projectId = "art-style-test-project";

afterEach(() => {
	clearProjectStore(projectId);
});

describe("createArtStylePlugin", () => {
	it("has the expected name", () => {
		expect(createArtStylePlugin().name).toBe("art-style");
	});

	it("prepends metadata.style with period separator when style is set", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({ style: "cinematic anime" });
		const { transformPrompt } = createArtStylePlugin();
		expect(transformPrompt?.("a cat on a roof", stateCtx(projectId))).toBe(
			"cinematic anime. a cat on a roof",
		);
	});

	it("returns prompt unchanged when style is empty", () => {
		const { transformPrompt } = createArtStylePlugin();
		expect(transformPrompt?.("a cat on a roof", stateCtx(projectId))).toBe(
			"a cat on a roof",
		);
	});

	it("returns prompt unchanged when style is whitespace-only", () => {
		getProjectStore(projectId).getState().updateMetadata({ style: "   " });
		const { transformPrompt } = createArtStylePlugin();
		expect(transformPrompt?.("a cat on a roof", stateCtx(projectId))).toBe(
			"a cat on a roof",
		);
	});
});
