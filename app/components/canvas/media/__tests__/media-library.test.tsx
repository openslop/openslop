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
	mountOnCanvas,
	noHistory,
} from "@/app/components/canvas/__tests__/_mount";
import { MediaPanelProvider } from "../media-panel-context";
import { MediaLibrary } from "../media-library";

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let canvas: ReturnType<typeof mountOnCanvas>;
let store: ProjectStore;
afterEach(() => canvas.unmount());

const open = () => {
	canvas = mountOnCanvas([]);
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
});
