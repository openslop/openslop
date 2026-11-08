// @vitest-environment happy-dom

import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { references } from "@/lib/canvas/__tests__/_assets";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { AssetEditProvider } from "@/app/components/canvas/elements/character/asset-edit-provider";
import { click, mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { AssetStrip } from "../asset-strip";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;
let store: ProjectStore;
afterEach(() => canvas.unmount());

const open = (children: Descendant[] = []) => {
	canvas = mountOnCanvas(children);
	store = createProjectStore();
	canvas.render(
		<ProjectStoreProvider store={store}>
			<TooltipProvider>
				<AssetEditProvider>
					<AssetStrip />
				</AssetEditProvider>
			</TooltipProvider>
		</ProjectStoreProvider>,
	);
};

describe("AssetStrip", () => {
	it("shows the project's media and asks before removing an item", async () => {
		open();
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "video", name: "intro.mp4", url: "https://v/i" }]),
		);

		expect(document.body.textContent).toContain("intro");

		await click('button[aria-label="Remove intro"]');

		expect(store.getState().media).toHaveLength(1);
		expect(document.querySelector("[role=alertdialog]")?.textContent).toContain(
			"Remove intro?",
		);
	});

	it("shows an uploaded reference once, as a reference", async () => {
		open([references("https://img/a.png")]);
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "image", name: "a.png", url: "https://img/a.png" }]),
		);

		expect(
			document.querySelectorAll('[aria-label="Assets"] > li'),
		).toHaveLength(1);
	});
});
