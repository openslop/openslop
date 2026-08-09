import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { GenerationQueue } from "@/lib/generation/queue";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { getTemplateById } from "@/lib/templates/templates";
import { forCharacterAvatar } from "@/lib/connectors/image/plugins/characterAvatarNode";
import { needsGeneration } from "@/lib/generation/graph";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import { characterAvatarElementId } from "../characterAvatar";
import { createProjectStore, type ProjectStore } from "../store";

let queue: GenerationQueue;
let store: ProjectStore;

const apply = (templateId: string) =>
	applyTemplate(store, templateId, queue, DEFAULT_CONNECTOR_REGISTRY);

describe("applyTemplate", () => {
	beforeEach(() => {
		store = createProjectStore();
		queue = new GenerationQueue();
	});

	it("does not leak characters from a previous template", () => {
		apply("pov-life");
		expect(store.getState().metadata.characters).toHaveProperty("Protagonist");

		apply("sleep-story");
		expect(store.getState().metadata.characters).toEqual({});
	});

	it("replaces reference images on switch", () => {
		apply("pov-life");
		expect(store.getState().referenceImages.length).toBeGreaterThan(0);

		apply("sleep-story");
		expect(store.getState().referenceImages).toEqual(
			getTemplateById("sleep-story")?.referenceImages,
		);
	});

	it("wipes user-edited metadata fields not set by the next template", () => {
		const project = store.getState();
		project.updateMetadata({ title: "My Draft", style: "noir" });
		apply("pov-life");

		const { metadata } = store.getState();
		expect(metadata.title).toBe("");
		expect(metadata.style).toBe(
			getTemplateById("pov-life")?.style?.description,
		);
	});

	it("wipes reference images set outside the template before applying", () => {
		store.getState().setReferenceImages(["user://a.png", "user://b.png"]);

		apply("sleep-story");
		expect(store.getState().referenceImages).toEqual(
			getTemplateById("sleep-story")?.referenceImages,
		);
	});

	it("throws on an unknown template id instead of silently no-opping", () => {
		expect(() => apply("does-not-exist")).toThrow(/Unknown template id/);
	});

	it("wipes user-set narration before applying", () => {
		store.getState().updateMetadata({ narration: { accent: "british" } });

		apply("pov-life");
		expect(store.getState().metadata.narration).toEqual(
			getTemplateById("pov-life")?.narration ?? {},
		);
	});

	// The avatar resolves against the template's own style and characters, so
	// seeding before the metadata lands would record the previous project's
	// inputs and the avatar would be stale on arrival.
	it("seeds a prebuilt avatar that is not stale on arrival", () => {
		apply("pov-life");
		const name = "Protagonist";
		const node = nodeBuilder(
			DEFAULT_CONNECTOR_REGISTRY,
			store.getState(),
		)(forCharacterAvatar(name));

		expect(needsGeneration(node, queue)).toBe(false);
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
