// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { references } from "@/lib/canvas/__tests__/_assets";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { AssetEditProvider } from "@/app/components/canvas/elements/character/asset-edit-provider";
import { click, mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import {
	AssetStrip,
	AssetStripMedia,
	AssetStripReferences,
} from "../asset-strip";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;
let store: ProjectStore;
afterEach(() => canvas.unmount());

const open = (tiles: ReactNode, children: Descendant[] = []) => {
	canvas = mountOnCanvas(children);
	store = createProjectStore();
	canvas.render(
		<ProjectStoreProvider store={store}>
			<TooltipProvider>
				<AssetEditProvider>
					<AssetStrip>{tiles}</AssetStrip>
				</AssetEditProvider>
			</TooltipProvider>
		</ProjectStoreProvider>,
	);
};

describe("AssetStrip", () => {
	it("shows the project's media and asks before removing an item", async () => {
		open(<AssetStripMedia />);
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "video", name: "intro.mp4", url: "https://v/i" }]),
		);

		expect(document.body.textContent).toContain("intro");

		await click('button[aria-label="Delete intro"]');

		expect(store.getState().media).toHaveLength(1);
		expect(document.querySelector("[role=alertdialog]")?.textContent).toContain(
			"Delete intro?",
		);
	});

	it("shows an uploaded reference both as a reference and as media", async () => {
		open(
			<>
				<AssetStripReferences />
				<AssetStripMedia />
			</>,
			[references("https://img/a.png")],
		);
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "image", name: "a.png", url: "https://img/a.png" }]),
		);

		expect(
			document.querySelectorAll('[aria-label="Assets"] > li'),
		).toHaveLength(2);
	});
});
