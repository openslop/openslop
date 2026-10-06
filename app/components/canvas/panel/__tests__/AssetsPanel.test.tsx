// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { findAsset } from "@/lib/canvas/assets";
import { AssetEditProvider } from "../../elements/character/AssetEditProvider";
import { click, mountOnCanvas } from "../../__tests__/_mount";
import { AssetsPanel } from "../AssetsPanel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../elements/style/ArtStyleModal", () => ({
	ArtStyleModal: () => <span data-dialog="asset_style" />,
}));

let canvas: ReturnType<typeof mountOnCanvas>;
afterEach(() => canvas.unmount());

const open = () => {
	canvas = mountOnCanvas();
	canvas.render(
		<TooltipProvider>
			<AssetEditProvider>
				<AssetsPanel />
			</AssetEditProvider>
		</TooltipProvider>,
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
});
