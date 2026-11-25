// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TilePrimaryAction, useTilePlayer } from "../tile-actions";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const toastError = vi.hoisted(() => vi.fn());
vi.mock("@/lib/toast-error", () => ({ toastError }));

function Tile() {
	const player = useTilePlayer("https://cdn.example/clip.mp4", "clip");
	return (
		<>
			{player.primary && <TilePrimaryAction {...player.primary} />}
			{player.video}
		</>
	);
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	container = document.body.appendChild(document.createElement("div"));
	root = createRoot(container);
	act(() =>
		root.render(
			<TooltipProvider>
				<Tile />
			</TooltipProvider>,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const face = () => container.querySelector("button");
const video = () => container.querySelector("video");

describe("useTilePlayer", () => {
	it("plays the video in place when its face is chosen", () => {
		act(() => face()?.click());

		expect(video()?.getAttribute("src")).toBe("https://cdn.example/clip.mp4");
		expect(face()?.getAttribute("aria-label")).toBe("Stop clip");
	});

	it("goes back to its still and says so when the video fails", () => {
		act(() => face()?.click());

		act(() => video()?.dispatchEvent(new Event("error")));

		expect(video()).toBeNull();
		expect(face()?.getAttribute("aria-label")).toBe("Play clip");
		expect(toastError).toHaveBeenCalledWith(
			"the file could not load",
			"Could not play video",
		);
	});
});
