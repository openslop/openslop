// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockTotalCost } = vi.hoisted(() => ({
	mockTotalCost: { current: undefined as number | undefined },
}));

vi.mock("@/lib/project/project-cost", () => ({
	useProjectTotalCost: () => mockTotalCost.current,
}));

import { TooltipProvider } from "@/components/ui/tooltip";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { languageLabel } from "@/lib/project/language";
import { ProjectProvider } from "@/lib/project/project-provider";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore } from "@/lib/project/store";
import { getTemplate } from "@/lib/templates/templates";
import { ProjectPanel } from "../project-panel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas> | undefined;
beforeEach(() => {
	mockTotalCost.current = undefined;
});
afterEach(() => canvas?.unmount());

const renderPanel = (store = createProjectStore()) => {
	canvas = mountOnCanvas();
	return canvas.render(
		<ProjectProvider
			projectId="project-1"
			initialScript=""
			initialTranscript={[]}
		>
			<ProjectStoreProvider store={store}>
				<TooltipProvider>
					<ProjectPanel />
				</TooltipProvider>
			</ProjectStoreProvider>
		</ProjectProvider>,
	);
};

const triggers = () =>
	Array.from(document.body.querySelectorAll<HTMLButtonElement>("button"));

describe("ProjectPanel", () => {
	it("shows the settings the project was created with, none of them changeable", async () => {
		const store = createProjectStore();
		store.getState().updateScriptSettings({
			language: "fr",
			template: "sleep-story",
		});

		await renderPanel(store);

		const text = document.body.textContent ?? "";
		expect(text).toContain(languageLabel("fr"));
		expect(text).toContain(getTemplate("sleep-story").name);
		expect(triggers()).toHaveLength(4);
		expect(
			triggers().every(
				(trigger) => trigger.getAttribute("aria-disabled") === "true",
			),
		).toBe(true);
	});

	it("reads an unset template as none", async () => {
		await renderPanel();

		expect(document.body.textContent).toContain("None");
	});

	it("shimmers the cost until it loads", async () => {
		await renderPanel();

		const cost = document.body.querySelector('[data-slot="badge"]');
		expect(cost?.querySelector('[data-slot="skeleton"]')).not.toBeNull();
	});

	it("shows what the project has spent", async () => {
		mockTotalCost.current = 0.42;
		await renderPanel();

		const cost = document.body.querySelector('[data-slot="badge"]');
		expect(cost?.textContent).toBe("$0.42");
	});
});
