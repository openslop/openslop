// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
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
	it("opens the art style from its card before the canvas has one", async () => {
		open();

		await click('button[aria-label="Edit Art style"]');

		expect(openDialog()).toBe("asset_style");
	});
});
