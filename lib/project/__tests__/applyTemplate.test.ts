import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import * as templates from "@/lib/templates/templates";
import { clearProjectStore, getProjectStore } from "../store";

const { getTemplateById } = templates;

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
		expect(metadata.style).toBe(getTemplateById("pov-life")?.artStyle ?? "");
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

	describe("voiceId overrides", () => {
		afterEach(() => vi.restoreAllMocks());

		const stubTemplate = (
			overrides: Partial<ReturnType<typeof getTemplateById>>,
		) => {
			const base = getTemplateById("pov-life");
			if (!base) throw new Error("pov-life template missing");
			vi.spyOn(templates, "getTemplateById").mockReturnValue({
				...base,
				...overrides,
			});
		};

		it("applies narration voiceId from the template", () => {
			stubTemplate({
				narration: { gender: "masculine", voiceId: "tpl-narrator" },
			});

			applyTemplate(PROJECT_ID, "pov-life");

			expect(
				getProjectStore(PROJECT_ID).getState().metadata.narration.voiceId,
			).toBe("tpl-narrator");
		});

		it("applies character voiceId from the template", () => {
			stubTemplate({
				characters: {
					Alice: { appearance: "A girl", voiceId: "tpl-alice" },
				},
			});

			applyTemplate(PROJECT_ID, "pov-life");

			expect(
				getProjectStore(PROJECT_ID).getState().metadata.characters["Alice"]
					?.voiceId,
			).toBe("tpl-alice");
		});

		it("clears a previously-set narration voiceId when the template does not declare one", () => {
			getProjectStore(PROJECT_ID)
				.getState()
				.setNarration({ voiceId: "stale-narrator" });

			stubTemplate({ narration: { gender: "feminine" } });
			applyTemplate(PROJECT_ID, "pov-life");

			expect(
				getProjectStore(PROJECT_ID).getState().metadata.narration.voiceId,
			).toBeUndefined();
		});
	});
});
