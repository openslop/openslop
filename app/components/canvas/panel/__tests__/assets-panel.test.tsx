// @vitest-environment happy-dom

import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Descendant } from "slate";
import { findAsset } from "@/lib/canvas/assets";
import { references } from "@/lib/canvas/__tests__/_assets";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { EditorPanelProvider } from "../editor-panel-context";
import { AssetEditProvider } from "@/app/components/canvas/elements/character/asset-edit-provider";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { PlaygroundProvider } from "@/app/components/canvas/playground/playground-context";
import {
	chooseTileMenuItem,
	click,
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import { AssetsPanel } from "../assets-panel";

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../elements/style/art-style-modal", () => ({
	ArtStyleModal: () => <span data-dialog="asset_style" />,
}));

let canvas: ReturnType<typeof mountOnCanvas>;
let store: ProjectStore;
afterEach(() => canvas.unmount());

const open = (children: Descendant[] = []) => {
	canvas = mountOnCanvas(children);
	store = createProjectStore();
	canvas.render(
		<ProjectStoreProvider store={store}>
			<GenerationQueueProvider initialState={{}} storage={noHistory}>
				<TooltipProvider>
					<EditorPanelProvider>
						<PlaygroundProvider>
							<AssetEditProvider>
								<AssetsPanel />
							</AssetEditProvider>
						</PlaygroundProvider>
					</EditorPanelProvider>
				</TooltipProvider>
			</GenerationQueueProvider>
		</ProjectStoreProvider>,
	);
};

const openDialog = () =>
	document.body.querySelector<HTMLElement>("[data-dialog]")?.dataset.dialog;

describe("AssetsPanel", () => {
	it("adds the art style and opens it from the card's add button", async () => {
		open();

		await click('button[aria-label="Add art style"]');

		expect(findAsset(canvas.editor.children, "asset_style")).toBeDefined();
		expect(openDialog()).toBe("asset_style");
	});

	it("deletes the art style from its menu and offers to add one again", async () => {
		open();
		await click('button[aria-label="Add art style"]');

		await chooseTileMenuItem("Art style", "Delete");

		expect(findAsset(canvas.editor.children, "asset_style")).toBeUndefined();
		expect(
			document.body.querySelector('button[aria-label="Add art style"]'),
		).not.toBeNull();
	});

	it("offers no second art style once there is one", async () => {
		open();
		await click('button[aria-label="Add art style"]');

		expect(
			document.body.querySelector('button[aria-label="Add art style"]'),
		).toBeNull();
		expect(
			document.body.querySelector('button[aria-label="Edit Art style"]'),
		).not.toBeNull();
	});

	it("opens the art style dialog from a reference image", async () => {
		open([references("https://img/a.png")]);

		await click('button[aria-label="Edit Reference 1"]');

		expect(openDialog()).toBe("asset_style");
	});

	it("lists the media of the kind shown and deletes an item once confirmed", async () => {
		open();
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "audio", name: "theme.mp3", url: "https://a/t" }]),
		);

		expect(document.body.textContent).not.toContain("theme");
		await click('[role=radio][aria-label="Audio"]');
		expect(document.body.textContent).toContain("theme");

		await chooseTileMenuItem("theme", "Delete");

		expect(store.getState().media).toHaveLength(1);
		expect(document.querySelector("[role=alertdialog]")?.textContent).toContain(
			"Delete theme?",
		);

		await act(async () =>
			Array.from(document.querySelectorAll("[role=alertdialog] button"))
				.find((button) => button.textContent === "Delete")
				?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
		);

		expect(store.getState().media).toEqual([]);
	});
});
