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
import { AssetEditProvider } from "@/app/components/canvas/elements/named-asset/asset-edit-provider";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { MediaPanelProvider } from "@/app/components/canvas/media/media-panel-context";
import {
	EditorPanelProvider,
	useEditorPanel,
} from "@/app/components/canvas/panel/editor-panel-context";
import {
	chooseTileMenuItem,
	click,
	menuItems,
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import {
	AssetStrip,
	AssetStripAdd,
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

function OpenPanel() {
	const { active } = useEditorPanel();
	return <li data-open-panel={active ?? "none"} />;
}

const openPanel = () =>
	document.querySelector("[data-open-panel]")?.getAttribute("data-open-panel");

describe("AssetStrip", () => {
	it("offers to add an asset when the project has none yet", () => {
		open(<AssetStripAdd />);
		const add = document.querySelector<HTMLButtonElement>(
			'ul[aria-label="Assets"] > li > button',
		);
		expect(add?.textContent).toBe("Add asset");
		expect(add?.type).toBe("button");
	});

	it("opens the Assets panel from the add tile, and keeps it open", async () => {
		open(
			<>
				<AssetStripAdd />
				<OpenPanel />
			</>,
		);
		expect(openPanel()).toBe("none");
		await click('ul[aria-label="Assets"] button');
		expect(openPanel()).toBe("assets");
		await click('ul[aria-label="Assets"] button');
		expect(openPanel()).toBe("assets");
	});

	it("shows the project's media without offering to delete it", async () => {
		open(<AssetStripMedia />);
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "video", name: "intro.mp4", url: "https://v/i" }]),
		);

		expect(document.body.textContent).toContain("intro");

		await chooseTileMenuItem("intro");

		expect(menuItems()).not.toContain("Delete");
		expect(
			document.body.querySelector('button[aria-label="Delete intro"]'),
		).toBeNull();
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

		await click('button[aria-label="Remove Reference 1 from references"]');

		expect(referenceUrls()).toEqual([]);
		expect(store.getState().media).toHaveLength(1);
	});

	it("does not offer to delete a reference's file", async () => {
		await openUploadedReference();

		await chooseTileMenuItem("Reference 1");

		expect(menuItems()).not.toContain("Delete");
		expect(
			document.body.querySelector('button[aria-label="Delete Reference 1"]'),
		).toBeNull();
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
