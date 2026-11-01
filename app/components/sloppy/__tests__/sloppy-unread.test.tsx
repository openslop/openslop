// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	EditorPanelProvider,
	useEditorPanel,
} from "@/app/components/canvas/panel/editor-panel-context";
import { SloppyUnread } from "../sloppy-unread";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let loading = false;
vi.mock("../sloppy-provider", () => ({ useSloppy: () => ({ loading }) }));
vi.mock("@/app/components/canvas/workspace-context", () => ({
	useShowWorkspace: () => true,
}));

type Panel = ReturnType<typeof useEditorPanel>;
let panel: Panel;
function Reader({ onRead }: { onRead: (panel: Panel) => void }) {
	onRead(useEditorPanel());
	return null;
}

const App = () => (
	<EditorPanelProvider>
		<SloppyUnread />
		<Reader onRead={(read) => (panel = read)} />
	</EditorPanelProvider>
);

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

const setLoading = (value: boolean) => {
	loading = value;
	act(() => root.render(<App />));
};
const reply = () => {
	setLoading(true);
	setLoading(false);
};

beforeEach(() => {
	root = createRoot(container);
	setLoading(false);
});

afterEach(() => act(() => root.unmount()));

describe("SloppyUnread", () => {
	it("marks the Sloppy panel when a reply lands with it closed", () => {
		reply();

		expect(panel.notices).toEqual({ sloppy: "new reply" });
	});

	it("clears the notice when the Sloppy panel opens", () => {
		reply();

		act(() => panel.setActive("sloppy"));

		expect(panel.notices).toEqual({});
	});

	it("marks nothing while the Sloppy panel is open", () => {
		act(() => panel.setActive("sloppy"));

		reply();

		expect(panel.notices).toEqual({});
	});

	it("marks nothing on mount or when a message is sent", () => {
		expect(panel.notices).toEqual({});

		setLoading(true);

		expect(panel.notices).toEqual({});
	});
});
