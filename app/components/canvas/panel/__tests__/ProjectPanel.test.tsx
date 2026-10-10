// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { languageLabel } from "@/lib/project/language";
import { ProjectStoreProvider } from "@/lib/project/ProjectStoreProvider";
import { createProjectStore } from "@/lib/project/store";
import { getTemplate } from "@/lib/templates/templates";
import { ProjectPanel } from "../ProjectPanel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas> | undefined;
afterEach(() => canvas?.unmount());

const renderPanel = (store = createProjectStore()) => {
	canvas = mountOnCanvas();
	return canvas.render(
		<ProjectStoreProvider store={store}>
			<TooltipProvider>
				<ProjectPanel />
			</TooltipProvider>
		</ProjectStoreProvider>,
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
});
