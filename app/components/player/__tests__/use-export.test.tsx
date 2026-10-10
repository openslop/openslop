// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast } from "sonner";
import { runRender, type RenderUpdate } from "@/lib/render/render-client";
import type { RenderLayout } from "@/lib/render/types";
import { useExport } from "../use-export";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("sonner", () => ({
	toast: { custom: vi.fn(), error: vi.fn(), dismiss: vi.fn() },
}));
vi.mock("@/lib/render/render-client", () => ({ runRender: vi.fn() }));
vi.mock("../export-toast", () => ({
	ExportProgressToast: (props: { progress: number; onView: () => void }) => (
		<button data-toast={`progress ${props.progress}`} onClick={props.onView} />
	),
	ExportDoneToast: (props: {
		url: string;
		size: number;
		onView: () => void;
	}) => (
		<button
			data-toast={`done ${props.url} ${props.size}`}
			onClick={props.onView}
		/>
	),
}));

const LAYOUT = { series: [], sequences: {} } as unknown as RenderLayout;

let hook: ReturnType<typeof useExport>;
function Reader({ onRead }: { onRead: (value: typeof hook) => void }) {
	onRead(useExport());
	return null;
}

const container = document.body.appendChild(document.createElement("div"));
const toastContainer = document.body.appendChild(document.createElement("div"));
let root: Root;
let toastRoot: Root;

/** A render that reports `updates`, then stays in flight unless it `fails`. */
function renderReports(updates: RenderUpdate[], fails?: Error) {
	vi.mocked(runRender).mockImplementation(async function* () {
		yield* updates;
		if (fails) throw fails;
		await new Promise(() => {});
	});
}

const startExport = () =>
	act(async () => {
		void hook.exportVideo(LAYOUT, 2);
	});

/** Draws what the last `toast.custom` call would show and returns its card. */
function shownToast(): HTMLElement | null {
	const draw = vi.mocked(toast.custom).mock.lastCall?.[0];
	if (!draw) return null;
	act(() => toastRoot.render(draw("export")));
	return toastContainer.querySelector<HTMLElement>("[data-toast]");
}

beforeEach(() => {
	root = createRoot(container);
	toastRoot = createRoot(toastContainer);
	act(() => root.render(<Reader onRead={(read) => (hook = read)} />));
	vi.clearAllMocks();
});

afterEach(() =>
	act(() => {
		root.unmount();
		toastRoot.unmount();
	}),
);

describe("useExport", () => {
	it("starts idle with the popover closed", () => {
		expect(hook.state).toEqual({ status: "idle" });
		expect(hook.open).toBe(false);
	});

	it("follows the render from start to output", async () => {
		renderReports([
			{ status: "rendering", progress: 0.4 },
			{ status: "done", url: "/out.mp4", size: 1024 },
		]);

		await startExport();

		expect(runRender).toHaveBeenCalledWith(LAYOUT, 2);
		expect(hook.state).toEqual({
			status: "done",
			url: "/out.mp4",
			size: 1024,
		});
	});

	it("shows progress in a toast while the popover is closed", async () => {
		renderReports([{ status: "rendering", progress: 0.4 }]);

		await startExport();

		expect(shownToast()?.dataset.toast).toBe("progress 0.4");
		expect(toast.custom).toHaveBeenLastCalledWith(
			expect.any(Function),
			expect.objectContaining({ id: "export" }),
		);
	});

	it("shows the output in a toast while the popover is closed", async () => {
		renderReports([{ status: "done", url: "/out.mp4", size: 1024 }]);

		await startExport();

		expect(shownToast()?.dataset.toast).toBe("done /out.mp4 1024");
	});

	it("opens the popover from the toast, which then leaves", async () => {
		renderReports([{ status: "rendering", progress: 0.4 }]);
		await startExport();
		vi.mocked(toast.dismiss).mockClear();

		const card = shownToast();
		act(() => card?.click());

		expect(hook.open).toBe(true);
		expect(toast.dismiss).toHaveBeenCalledWith("export");
	});

	it("raises no toast while the popover is open", async () => {
		renderReports([{ status: "done", url: "/out.mp4", size: 1024 }]);
		act(() => hook.setOpen(true));

		await startExport();

		expect(toast.custom).not.toHaveBeenCalled();
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("turns a failed render into an error state and an error toast", async () => {
		renderReports([], new Error("Lambda timed out"));

		await startExport();

		expect(hook.state).toEqual({
			status: "error",
			message: "Lambda timed out",
		});
		expect(toast.error).toHaveBeenCalledWith(
			"Lambda timed out",
			expect.objectContaining({ id: "export" }),
		);
	});

	it("returns to idle on reset and drops the toast", async () => {
		renderReports([{ status: "done", url: "/out.mp4", size: 1024 }]);
		await startExport();
		vi.mocked(toast.dismiss).mockClear();

		act(() => hook.reset());

		expect(hook.state).toEqual({ status: "idle" });
		expect(toast.dismiss).toHaveBeenCalledWith("export");
	});

	it("drops the toast on unmount", async () => {
		renderReports([{ status: "rendering", progress: 0.4 }]);
		await startExport();
		vi.mocked(toast.dismiss).mockClear();

		act(() => root.render(null));

		expect(toast.dismiss).toHaveBeenCalledWith("export");
	});
});
