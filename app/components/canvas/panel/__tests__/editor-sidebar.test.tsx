// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorPanelProvider, useEditorPanel } from "../editor-panel-context";
import { EditorSidebar } from "../editor-sidebar";
import {
	PINNED_PANEL_KEYS,
	RAIL_PANEL_GROUPS,
	type PanelKey,
} from "../panel-keys";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));
vi.mock("../assets-panel", () => ({ AssetsPanel: () => null }));
vi.mock("../canvas-history-panel", () => ({ CanvasHistoryPanel: () => null }));
vi.mock("../captions-panel", () => ({ CaptionsPanel: () => null }));
vi.mock("../effects-panel", () => ({ EffectsPanel: () => null }));
vi.mock("../layout-panel", () => ({ LayoutPanel: () => null }));
vi.mock("../models-panel", () => ({ ModelsPanel: () => null }));
vi.mock("../project-panel", () => ({ ProjectPanel: () => null }));
vi.mock("../properties-panel", () => ({ PropertiesPanel: () => null }));
vi.mock("@/app/components/sloppy/sloppy-panel", () => ({
	SloppyPanel: () => null,
}));
vi.mock("@/app/components/sloppy/sloppy-composer", () => ({
	SloppyComposer: () => null,
}));

const PANEL_KEYS: PanelKey[] = [
	...RAIL_PANEL_GROUPS.flat(),
	...PINNED_PANEL_KEYS,
];

type Panel = ReturnType<typeof useEditorPanel>;
let panel: Panel;
function Reader({ onRead }: { onRead: (panel: Panel) => void }) {
	onRead(useEditorPanel());
	return null;
}

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

const closeButton = () =>
	container.querySelector<HTMLButtonElement>(
		'button[aria-label="Close panel"]',
	);
const pressedRailItems = () =>
	container.querySelectorAll('nav[aria-label="Panels"] [aria-pressed="true"]');

beforeEach(() => {
	root = createRoot(container);
	act(() =>
		root.render(
			<TooltipProvider>
				<EditorPanelProvider>
					<EditorSidebar />
					<Reader onRead={(read) => (panel = read)} />
				</EditorPanelProvider>
			</TooltipProvider>,
		),
	);
});

afterEach(() => act(() => root.unmount()));

describe("EditorSidebar close button", () => {
	it.each(PANEL_KEYS)("closes the %s panel", (key) => {
		act(() => panel.setActive(key));
		expect(pressedRailItems()).toHaveLength(1);

		act(() => closeButton()?.click());

		expect(panel.active).toBeNull();
		expect(container.querySelector("h2")).toBeNull();
		expect(pressedRailItems()).toHaveLength(0);
	});

	it("is a labelled native button that takes keyboard focus", () => {
		act(() => panel.setActive("assets"));
		const button = closeButton();

		expect(button?.type).toBe("button");
		button?.focus();
		expect(document.activeElement).toBe(button);
	});

	it("is absent while no panel is open", () => {
		expect(panel.active).toBeNull();
		expect(closeButton()).toBeNull();
	});
});
