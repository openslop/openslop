// @vitest-environment happy-dom

import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import { createProjectStore, type ProjectStore } from "@/lib/project/store";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { EditorPanelProvider } from "@/app/components/canvas/panel/editor-panel-context";
import {
	chooseTileMenuItem,
	click,
	menuItems,
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { toCaption } from "@/lib/captions/word-captions";
import { MediaPanelProvider } from "../media-panel-context";
import { MediaLibrary } from "../media-library";

const { transcribe } = vi.hoisted(() => ({ transcribe: vi.fn() }));
vi.mock("@/lib/connectors/use-create-connector", () => ({
	useCreateConnector: () => () => ({ generate: transcribe }),
}));

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));
vi.mock("../../elements/audio-player", () => ({ AudioPlayer: () => null }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;
let store: ProjectStore;
afterEach(() => canvas.unmount());

const open = () => {
	canvas = mountOnCanvas([asset("asset_media_image")]);
	store = createProjectStore();
	canvas.render(
		<ProjectStoreProvider store={store}>
			<GenerationQueueProvider initialState={{}} storage={noHistory}>
				<TooltipProvider>
					<EditorPanelProvider>
						<MediaPanelProvider>
							<MediaLibrary type="image" />
						</MediaPanelProvider>
					</EditorPanelProvider>
				</TooltipProvider>
			</GenerationQueueProvider>
		</ProjectStoreProvider>,
	);
};

const chooseCaptions = (action: string) =>
	chooseTileMenuItem("song", "Captions", action);

describe("MediaLibrary", () => {
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

	it("offers to delete a picture", async () => {
		open();
		await act(async () =>
			store
				.getState()
				.addMedia([{ kind: "image", name: "pic.png", url: "https://i/p" }]),
		);

		await chooseTileMenuItem("pic");

		expect(menuItems()).toContain("Delete");
	});

	it("generates, regenerates and removes a file's captions from its Captions submenu", async () => {
		const words = [toCaption("hello", 0, 0.4)];
		transcribe.mockResolvedValue({ durationSec: 2, textTimestamps: words });
		open();
		await click('[role=radio][aria-label="Audio"]');
		await act(async () =>
			store
				.getState()
				.addMedia([
					{ kind: "audio", name: "song.mp3", url: "https://blob/song.mp3" },
				]),
		);

		await chooseCaptions("Generate captions");

		expect(transcribe).toHaveBeenCalledWith({
			prompt: "",
			mediaUrl: "https://blob/song.mp3",
		});
		expect(store.getState().media[0]?.captions).toEqual(words);

		await chooseCaptions("Regenerate captions");

		expect(transcribe).toHaveBeenCalledTimes(2);

		await chooseCaptions("Remove captions");
		await act(async () =>
			Array.from(document.querySelectorAll("[role=alertdialog] button"))
				.find((button) => button.textContent === "Remove captions")
				?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
		);

		expect(store.getState().media[0]?.captions).toBeUndefined();
	});

	it("shows what a generated take cost in its larger view, not on the tile", async () => {
		open();
		await act(async () =>
			store.getState().addMedia([
				{
					kind: "image",
					name: "generated.png",
					url: "https://a/gen",
					costUsd: 0.12,
				},
				{
					kind: "image",
					name: "uploaded.png",
					url: "https://a/up",
					uploaded: true,
				},
			]),
		);
		expect(document.body.textContent).not.toContain("$");

		await chooseTileMenuItem("generated", "View larger");
		expect(
			document.querySelector('[role=dialog] [data-slot="badge"]')?.textContent,
		).toBe("$0.12");
	});

	it("leaves the cost out of the larger view of uploaded media", async () => {
		open();
		await act(async () =>
			store.getState().addMedia([
				{
					kind: "image",
					name: "uploaded.png",
					url: "https://a/up",
					uploaded: true,
				},
			]),
		);

		await chooseTileMenuItem("uploaded", "View larger");
		expect(document.querySelector("[role=dialog]")?.textContent).not.toContain(
			"$",
		);
	});
});
