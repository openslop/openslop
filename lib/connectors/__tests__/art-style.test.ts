import { afterEach, describe, expect, it } from "vitest";
import { createArtStylePlugin } from "../plugins/art-style";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";

const projectId = "art-style-test-project";

afterEach(() => {
	clearProjectStore(projectId);
});

describe("createArtStylePlugin", () => {
	it("has the expected name", () => {
		expect(createArtStylePlugin(projectId).name).toBe("art-style");
	});

	it("prepends metadata.style with period separator when style is set", () => {
		getProjectStore(projectId)
			.getState()
			.updateMetadata({ style: "cinematic anime" });
		const { transformPrompt } = createArtStylePlugin(projectId);
		expect(transformPrompt?.("a cat on a roof")).toBe(
			"cinematic anime. a cat on a roof",
		);
	});

	it("returns prompt unchanged when style is empty", () => {
		const { transformPrompt } = createArtStylePlugin(projectId);
		expect(transformPrompt?.("a cat on a roof")).toBe("a cat on a roof");
	});

	it("returns prompt unchanged when style is whitespace-only", () => {
		getProjectStore(projectId).getState().updateMetadata({ style: "   " });
		const { transformPrompt } = createArtStylePlugin(projectId);
		expect(transformPrompt?.("a cat on a roof")).toBe("a cat on a roof");
	});
});
