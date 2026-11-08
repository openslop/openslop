// @vitest-environment happy-dom

import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Descendant } from "slate";
import { findAsset } from "@/lib/canvas/assets";
import { references } from "@/lib/canvas/__tests__/_assets";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { AssetEditProvider } from "@/app/components/canvas/elements/character/asset-edit-provider";
import { click, mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { AssetsPanel } from "../assets-panel";

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
			<TooltipProvider>
				<AssetEditProvider>
					<AssetsPanel />
				</AssetEditProvider>
			</TooltipProvider>
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

	it("lists the media and removes an item once confirmed", async () => {
		open();
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "audio", name: "theme.mp3", url: "https://a/t" }]),
		);

		expect(document.body.textContent).toContain("theme");

		await click('button[aria-label="Remove theme"]');

		expect(store.getState().media).toHaveLength(1);
		expect(document.querySelector("[role=alertdialog]")?.textContent).toContain(
			"Remove theme?",
		);

		await act(async () =>
			Array.from(document.querySelectorAll("[role=alertdialog] button"))
				.find((button) => button.textContent === "Remove")
				?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
		);

		expect(store.getState().media).toEqual([]);
	});
});
