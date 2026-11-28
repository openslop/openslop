// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Pencil, User } from "@/components/ui/icon";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	chooseTileMenuItem,
	click,
	menuItems,
	mountOnCanvas,
} from "@/app/components/canvas/__tests__/_mount";
import { AssetTile } from "../asset-tile";

const AVATAR = "https://cdn.example/mia.png";
const EDIT = 'button[aria-label="Edit Mia"]';
const MENU = 'button[aria-label="More actions for Mia"]';

const onEdit = vi.fn();
let canvas: ReturnType<typeof mountOnCanvas>;

const onRemove = vi.fn();
const onDelete = vi.fn();

function renderTile(
	previewUrl?: string,
	actions: { onRemove?: () => void; onDelete?: () => void } = {},
) {
	canvas.render(
		<TooltipProvider>
			<AssetTile
				name="Mia"
				previewUrl={previewUrl}
				Icon={User}
				primary={{ label: "Edit Mia", icon: Pencil, onSelect: onEdit }}
				{...actions}
			/>
		</TooltipProvider>,
	);
}

const query = (selector: string) => document.body.querySelector(selector);

const viewer = () => document.body.querySelector('[role="dialog"]');

const viewLarger = () => chooseTileMenuItem("Mia", "View larger");

beforeEach(() => {
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

	it("removes and deletes from their own buttons, not the menu", async () => {
		renderTile(AVATAR, { onRemove, onDelete });

		await click('button[aria-label="Remove Mia"]');
		expect(onRemove).toHaveBeenCalledOnce();
		await click('button[aria-label="Delete Mia"]');
		expect(onDelete).toHaveBeenCalledOnce();
		expect(onEdit).not.toHaveBeenCalled();

		await chooseTileMenuItem("Mia");
		expect(menuItems()).toEqual(["View larger"]);
	});

	it("shows no corner buttons when the tile can be neither removed nor deleted", () => {
		renderTile(AVATAR);

		expect(query('button[aria-label="Remove Mia"]')).toBeNull();
		expect(query('button[aria-label="Delete Mia"]')).toBeNull();
	});

	it("hides the ⋮ when only Remove and Delete would have been in it", () => {
		renderTile(undefined, { onRemove, onDelete });

		expect(query(MENU)).toBeNull();
		expect(query('button[aria-label="Remove Mia"]')).not.toBeNull();
	});

	it("leads the caption with the asset's icon", () => {
		renderTile();
		expect(
			document.body.querySelector('[data-slot="thumbnail-caption"] .icon'),
		).not.toBeNull();
	});
});
