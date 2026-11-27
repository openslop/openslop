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
	AssetCanvasStrip,
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

const mount = (node: ReactNode, children: Descendant[] = []) => {
	canvas = mountOnCanvas(children);
	store = createProjectStore();
	canvas.render(
		<ProjectStoreProvider store={store}>
			<GenerationQueueProvider initialState={{}} storage={noHistory}>
				<TooltipProvider>
					<EditorPanelProvider>
						<MediaPanelProvider>
							<AssetEditProvider>{node}</AssetEditProvider>
						</MediaPanelProvider>
					</EditorPanelProvider>
				</TooltipProvider>
			</GenerationQueueProvider>
		</ProjectStoreProvider>,
	);
};

const open = (tiles: ReactNode, children: Descendant[] = []) =>
	mount(<AssetStrip>{tiles}</AssetStrip>, children);

function OpenPanel() {
	const { active } = useEditorPanel();
	return <span data-open-panel={active ?? "none"} />;
}

const openCanvasStrip = (children: Descendant[] = []) =>
	mount(
		<>
			<AssetCanvasStrip />
			<OpenPanel />
		</>,
		children,
	);

const ADD = 'button[aria-label="Add asset"]';
const list = () => document.querySelector('ul[aria-label="Assets"]');
const placeholder = () => document.querySelector('[role="status"]');

const openPanel = () =>
	document.querySelector("[data-open-panel]")?.getAttribute("data-open-panel");

describe("AssetStrip", () => {
	it("shows a placeholder and a bare + button when the project has no assets yet", () => {
		openCanvasStrip();

		expect(list()).toBeNull();
		expect(placeholder()?.textContent).toContain("No assets yet");
		const add = document.querySelector<HTMLButtonElement>(ADD);
		expect(add?.type).toBe("button");
		expect(add?.textContent).toBe("");
		expect(add?.querySelector('[data-slot="thumbnail-face"]')).toBeNull();
	});

	it("opens the Assets panel from the + button, and keeps it open", async () => {
		openCanvasStrip();

		expect(openPanel()).toBe("none");
		await click(ADD);
		expect(openPanel()).toBe("assets");
		await click(ADD);
		expect(openPanel()).toBe("assets");
	});

	it("lists the assets beside the + button, not with it", () => {
		openCanvasStrip([references("https://img/a.png")]);

		expect(placeholder()).toBeNull();
		expect(
			list()?.querySelector('[aria-label="More actions for Reference 1"]'),
		).not.toBeNull();
		const add = document.querySelector(ADD);
		expect(add).not.toBeNull();
		expect(list()?.contains(add)).toBe(false);
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

	it("does not offer to delete a reference's file", async () => {
		await openUploadedReference();

		await chooseTileMenuItem("Reference 1");

		expect(menuItems()).not.toContain("Delete");
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
