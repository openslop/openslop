// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Descendant } from "slate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { references } from "@/lib/canvas/__tests__/_assets";
import { findAsset, REFERENCE_URLS_ATTR } from "@/lib/canvas/assets";
import { parseReferenceImages } from "@/lib/connectors/attributes/reference-images";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { AssetEditProvider } from "@/app/components/canvas/elements/character/asset-edit-provider";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { MediaPanelProvider } from "@/app/components/canvas/media/media-panel-context";
import { EditorPanelProvider } from "@/app/components/canvas/panel/editor-panel-context";
import {
	chooseTileMenuItem,
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import {
	AssetStrip,
	AssetStripMedia,
	AssetStripReferences,
} from "../asset-strip";

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;
let store: ProjectStore;
afterEach(() => canvas.unmount());

const open = (tiles: ReactNode, children: Descendant[] = []) => {
	canvas = mountOnCanvas(children);
	store = createProjectStore();
	canvas.render(
		<ProjectStoreProvider store={store}>
			<GenerationQueueProvider initialState={{}} storage={noHistory}>
				<TooltipProvider>
					<EditorPanelProvider>
						<MediaPanelProvider>
							<AssetEditProvider>
								<AssetStrip>{tiles}</AssetStrip>
							</AssetEditProvider>
						</MediaPanelProvider>
					</EditorPanelProvider>
				</TooltipProvider>
			</GenerationQueueProvider>
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

		await chooseTileMenuItem("intro", "Delete");

		expect(store.getState().media).toHaveLength(1);
		expect(document.querySelector("[role=alertdialog]")?.textContent).toContain(
			"Delete intro?",
		);
	});

	const openUploadedReference = async () => {
		open(<AssetStripReferences />, [references("https://img/a.png")]);
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "image", name: "a.png", url: "https://img/a.png" }]),
		);
	};

	const referenceUrls = () =>
		parseReferenceImages(
			findAsset(canvas.editor.children, "asset_references")
				?.generationAttributes?.[REFERENCE_URLS_ATTR],
		) ?? [];

	it("takes a reference off the references and keeps its file", async () => {
		await openUploadedReference();

		await chooseTileMenuItem("Reference 1", "Remove from references");

		expect(referenceUrls()).toEqual([]);
		expect(store.getState().media).toHaveLength(1);
	});

	it("deletes a reference's file from the media and the references once confirmed", async () => {
		await openUploadedReference();

		await chooseTileMenuItem("Reference 1", "Delete");
		await act(async () =>
			Array.from(document.querySelectorAll("[role=alertdialog] button"))
				.find((button) => button.textContent === "Delete")
				?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
		);

		expect(store.getState().media).toEqual([]);
		expect(referenceUrls()).toEqual([]);
	});

	it("shows an uploaded reference once, as a reference", async () => {
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
		).toHaveLength(1);
		expect(
			document.querySelector('button[aria-label="Edit Reference 1"]'),
		).not.toBeNull();
	});
});
