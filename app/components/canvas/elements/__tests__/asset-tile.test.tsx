// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Pencil, User } from "@/components/ui/icon";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	chooseTileMenuItem,
	click,
	mountOnCanvas,
} from "@/app/components/canvas/__tests__/_mount";
import { AssetTile } from "../asset-tile";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const AVATAR = "https://cdn.example/mia.png";
const EDIT = 'button[aria-label="Edit Mia"]';
const MENU = 'button[aria-label="More actions for Mia"]';

const onEdit = vi.fn();
let canvas: ReturnType<typeof mountOnCanvas>;

function renderTile(previewUrl?: string) {
	canvas.render(
		<TooltipProvider>
			<AssetTile
				name="Mia"
				previewUrl={previewUrl}
				Icon={User}
				primary={{ label: "Edit Mia", icon: Pencil, onSelect: onEdit }}
			/>
		</TooltipProvider>,
	);
}

const viewer = () => document.body.querySelector('[role="dialog"]');

const viewLarger = () => chooseTileMenuItem("Mia", "View larger");

beforeEach(() => {
	onEdit.mockClear();
	canvas = mountOnCanvas();
});

afterEach(() => canvas.unmount());

describe("AssetTile", () => {
	it("edits the asset when its face is chosen", async () => {
		renderTile(AVATAR);
		await click(EDIT);

		expect(onEdit).toHaveBeenCalledOnce();
	});

	it("opens the full-size picture from its menu without editing the asset", async () => {
		renderTile(AVATAR);
		await viewLarger();

		expect(onEdit).not.toHaveBeenCalled();
		expect(viewer()?.querySelector("img")?.getAttribute("src")).toBe(AVATAR);
		expect(viewer()?.textContent).toContain("Mia");
	});

	it("closes the larger view on Escape and hands focus back to the menu", async () => {
		renderTile(AVATAR);
		await viewLarger();
		await act(async () => {
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await act(() => new Promise((resolve) => setTimeout(resolve)));

		expect(viewer()).toBeNull();
		expect(document.activeElement).toBe(document.body.querySelector(MENU));
	});

	it("leads the caption with the asset's icon", () => {
		renderTile();
		expect(
			document.body.querySelector('[data-slot="thumbnail-caption"] .icon'),
		).not.toBeNull();
	});
});
