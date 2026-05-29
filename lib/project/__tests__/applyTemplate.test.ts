import { beforeEach, describe, expect, it } from "vitest";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { getTemplateById } from "@/lib/templates/templates";
import { clearProjectStore, getProjectStore } from "../store";

const PROJECT_ID = "apply-template-test";

describe("applyTemplate", () => {
	beforeEach(() => clearProjectStore(PROJECT_ID));

	it("does not leak characters from a previous template", () => {
		applyTemplate(PROJECT_ID, "pov-life");
		expect(
			getProjectStore(PROJECT_ID).getState().metadata.characters,
		).toHaveProperty("Protagonist");

		applyTemplate(PROJECT_ID, "sleep-story");
		expect(getProjectStore(PROJECT_ID).getState().metadata.characters).toEqual(
			{},
		);
	});

	it("replaces reference images on switch", () => {
		applyTemplate(PROJECT_ID, "pov-life");
		expect(
			getProjectStore(PROJECT_ID).getState().referenceImages.length,
		).toBeGreaterThan(0);

		applyTemplate(PROJECT_ID, "sleep-story");
		expect(getProjectStore(PROJECT_ID).getState().referenceImages).toEqual(
			getTemplateById("sleep-story")?.referenceImages,
		);
	});

	it("wipes user-edited metadata fields not set by the next template", () => {
		const project = getProjectStore(PROJECT_ID).getState();
		project.updateMetadata({ title: "My Draft", style: "noir" });
		applyTemplate(PROJECT_ID, "pov-life");

		const { metadata } = getProjectStore(PROJECT_ID).getState();
		expect(metadata.title).toBe("");
		expect(metadata.style).toBe("");
	});

	it("wipes reference images set outside the template before applying", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.setReferenceImages(["user://a.png", "user://b.png"]);

		applyTemplate(PROJECT_ID, "sleep-story");
		expect(getProjectStore(PROJECT_ID).getState().referenceImages).toEqual(
			getTemplateById("sleep-story")?.referenceImages,
		);
	});

	it("wipes user-set narration before applying", () => {
		getProjectStore(PROJECT_ID)
			.getState()
			.updateMetadata({ narration: { accent: "british" } });

		applyTemplate(PROJECT_ID, "pov-life");
		expect(getProjectStore(PROJECT_ID).getState().metadata.narration).toEqual(
			getTemplateById("pov-life")?.narration ?? {},
		);
	});
});
