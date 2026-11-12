// @vitest-environment happy-dom

import { act, useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { asset, references } from "@/lib/canvas/__tests__/_assets";
import { findAsset } from "@/lib/canvas/assets";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import type { AssetElement } from "@/lib/canvas/types";
import type { LLMGenerateParams } from "@/lib/connectors/types";
import {
	GenerationQueueProvider,
	useGenerationQueue,
} from "@/lib/generation/generation-queue-provider";
import type { GenerationQueue } from "@/lib/generation/queue";
import { resultQueue } from "@/lib/project/__tests__/_canvas";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore } from "@/lib/project/store";
import {
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import { EditorPanelProvider } from "@/app/components/canvas/panel/editor-panel-context";
import { ArtStyleModal } from "../art-style-modal";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const generate = vi.fn(async (_params: LLMGenerateParams) => ({
	text: "Soft watercolor.",
	model: "test",
}));
vi.mock("@/lib/connectors/use-create-connector", () => ({
	useCreateConnector: () => () => ({ generate }),
}));
vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));
vi.mock("@/lib/connectors/use-default-models", () => ({
	useDefaultModels: () => ({ llm: { provider: "openai", model: "test" } }),
}));
vi.mock("@/lib/components/image-with-shimmer", () => ({
	ImageWithShimmer: ({ src, alt }: { src: string; alt: string }) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt} />
	),
}));

const onClose = vi.fn();
let canvas: ReturnType<typeof mountOnCanvas>;
let queue: GenerationQueue;

function Modal() {
	const current = useGenerationQueue();
	useEffect(() => {
		queue = current;
	}, [current]);
	return <ArtStyleModal onClose={onClose} />;
}

function open(
	assets: AssetElement[] = [],
	results: Parameters<typeof resultQueue>[0] = {},
) {
	canvas = mountOnCanvas(assets);
	canvas.render(
		<ProjectStoreProvider store={createProjectStore()}>
			<GenerationQueueProvider
				initialState={resultQueue(results).snapshot()}
				storage={noHistory}
			>
				<EditorPanelProvider>
					<TooltipProvider>
						<Dialog open>
							<Modal />
						</Dialog>
					</TooltipProvider>
				</EditorPanelProvider>
			</GenerationQueueProvider>
		</ProjectStoreProvider>,
	);
}

afterEach(() => canvas.unmount());

const avatars = () =>
	document.body.querySelector('section[aria-label="Character avatars"]');
const avatarUrls = () =>
	Array.from(avatars()?.querySelectorAll("img") ?? [], (image) =>
		image.getAttribute("src"),
	);
const deriveButton = () => {
	const button = Array.from(document.body.querySelectorAll("button")).find(
		(each) => each.textContent === "Use images and avatars",
	);
	if (!button) throw new Error("no art style derivation button");
	return button;
};

describe("ArtStyleModal", () => {
	it("shows only uploaded avatars, read-only, and derives from both visible sources", async () => {
		const uploaded = asset("asset_avatar", { name: "Mira" });
		const generated = asset("asset_avatar", { name: "Generated" });
		open([references("https://img/reference.png"), uploaded, generated], {
			[uploaded.id]: { imageUrl: "https://img/uploaded.png", uploaded: true },
			[generated.id]: { imageUrl: "https://img/generated.png" },
		});

		expect(avatarUrls()).toEqual(["https://img/uploaded.png"]);
		expect(avatars()?.textContent).toContain("Mira");
		expect(avatars()?.querySelector('button[aria-label^="Remove"]')).toBeNull();
		expect(avatars()?.querySelector('button[aria-label^="Edit"]')).toBeNull();

		await act(async () => deriveButton().click());

		expect(generate).toHaveBeenCalledWith(
			expect.objectContaining({
				referenceImages: [
					"https://img/reference.png",
					"https://img/uploaded.png",
				],
			}),
		);
		const style = findAsset(canvas.editor.children, "asset_style");
		expect(style && getElementBodyText(style)).toBe("Soft watercolor.");
	});

	it("shows an empty state for generated avatars and explains the unavailable action", () => {
		const generated = asset("asset_avatar", { name: "Generated" });
		open([generated], {
			[generated.id]: { imageUrl: "https://img/generated.png" },
		});

		expect(avatarUrls()).toEqual([]);
		expect(avatars()?.textContent).toContain(
			"No uploaded character avatars yet",
		);
		expect(deriveButton().getAttribute("aria-disabled")).toBe("true");
		expect(deriveButton().getAttribute("aria-label")).toBe(
			"Upload reference images or character avatars to describe their art style",
		);
	});

	it("follows uploaded avatar changes while the modal stays open", async () => {
		const avatar = asset("asset_avatar", { name: "Mira" });
		open([avatar]);

		for (const imageUrl of [
			"https://img/first.png",
			"https://img/second.png",
		]) {
			await act(async () =>
				queue.replaceSnapshots(
					resultQueue({ [avatar.id]: { imageUrl, uploaded: true } }).snapshot(),
				),
			);
			expect(avatarUrls()).toEqual([imageUrl]);
			expect(deriveButton().getAttribute("aria-disabled")).toBeNull();
		}

		await act(async () => queue.discard(avatar.id));

		expect(avatars()?.textContent).toContain(
			"No uploaded character avatars yet",
		);
		expect(deriveButton().getAttribute("aria-disabled")).toBe("true");
	});
});
