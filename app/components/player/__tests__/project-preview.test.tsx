// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { RenderLayout } from "@/lib/render/types";
import { ProjectPreview } from "../project-preview";

vi.mock("next/dynamic", () => ({
	default: () => () => null,
}));
vi.mock("../../toast-error-boundary", () => ({
	ToastErrorBoundary: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../active-scene-sync", () => ({ ActiveSceneSync: () => null }));
vi.mock("../player-control-context", () => ({
	usePlayerControl: () => ({ player: null, registerPlayer: () => {} }),
}));
vi.mock("../play-pause-flash", () => ({ PlayPauseFlash: () => null }));

it("keeps the play surface in the keyboard tab order", () => {
	const markup = renderToStaticMarkup(
		<ProjectPreview layout={{} as RenderLayout} />,
	);
	const wrapper = document.createElement("div");
	wrapper.innerHTML = markup;
	const playButton = wrapper.querySelector<HTMLButtonElement>(
		'button[aria-label="Play or pause"]',
	);

	expect(playButton).not.toBeNull();
	expect(playButton?.hasAttribute("tabindex")).toBe(false);
	expect(playButton?.tabIndex).toBe(0);
	expect(playButton?.className).toContain("focus-ring");
	expect(playButton?.className).toContain("focus-visible:ring-inset");
});
