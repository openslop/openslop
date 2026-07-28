import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { GenerationQueue } from "@/lib/generation/queue";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { getTemplateById } from "@/lib/templates/templates";
import { characterAvatarElementId } from "../characterAvatar";
import { clearProjectStore, getProjectStore } from "../store";

const PROJECT_ID = "apply-template-test";

let queue: GenerationQueue;

const apply = (templateId: string) =>
	applyTemplate(PROJECT_ID, templateId, queue, DEFAULT_CONNECTOR_REGISTRY);

describe("applyTemplate", () => {
	beforeEach(() => {
		clearProjectStore(PROJECT_ID);
		queue = new GenerationQueue({ batchSize: 1 });
	});

	it("does not leak characters from a previous template", () => {
		apply("pov-life");
		expect(
			getProjectStore(PROJECT_ID).getState().metadata.characters,
		).toHaveProperty("Protagonist");

		apply("sleep-story");
		expect(getProjectStore(PROJECT_ID).getState().metadata.characters).toEqual(
			{},
		);
	});

	it("replaces reference images on switch", () => {
		apply("pov-life");
		expect(
			getProjectStore(PROJECT_ID).getState().referenceImages.length,
		).toBeGreaterThan(0);

		apply("sleep-story");
		expect(getProjectStore(PROJECT_ID).getState().referenceImages).toEqual(
			getTemplateById("sleep-story")?.referenceImages,
		);
	});

	it("wipes user-edited metadata fields not set by the next template", () => {
		const project = getProjectStore(PROJECT_ID).getState();
		project.updateMetadata({ title: "My Draft", style: "noir" });
		apply("pov-life");

		const { metadata } = getProjectStore(PROJECT_ID).getState();
		expect(metadata.title).toBe("");
		expect(metadata.style).toBe(getTemplateById("pov-life")?.style);
	});

	it("wipes reference images set outside the template before applying", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.setReferenceImages(["user://a.png", "user://b.png"]);

		apply("sleep-story");
		expect(getProjectStore(PROJECT_ID).getState().referenceImages).toEqual(
			getTemplateById("sleep-story")?.referenceImages,
		);
	});

	it("throws on an unknown template id instead of silently no-opping", () => {
		expect(() => apply("does-not-exist")).toThrow(/Unknown template id/);
	});

	it("wipes user-set narration before applying", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({ narration: { accent: "british" } });

		apply("pov-life");
		expect(getProjectStore(PROJECT_ID).getState().metadata.narration).toEqual(
			getTemplateById("pov-life")?.narration ?? {},
		);
	});

	it("seeds prebuilt template avatars as the avatar node's result", () => {
		apply("pov-life");
		const snapshot = queue.getElementSnapshot(
			characterAvatarElementId("Protagonist"),
		);
		expect(snapshot.result?.imageUrl).toBe(
			getTemplateById("pov-life")?.characterAvatars?.Protagonist,
		);
		expect(snapshot.resultInputs).not.toBeNull();
	});
});
