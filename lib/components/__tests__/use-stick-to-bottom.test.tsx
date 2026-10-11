// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useStickToBottom } from "../use-stick-to-bottom";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let resize: () => void = () => {};
vi.stubGlobal(
	"ResizeObserver",
	class {
		constructor(callback: () => void) {
			resize = callback;
		}
		observe() {}
		disconnect() {}
	},
);

const scroller = document.body.appendChild(document.createElement("div"));
scroller.style.overflowY = "auto";
const geometry = { scrollHeight: 1000, clientHeight: 300 };
Object.defineProperties(scroller, {
	scrollHeight: { get: () => geometry.scrollHeight },
	clientHeight: { get: () => geometry.clientHeight },
});
const bottom = () => geometry.scrollHeight - geometry.clientHeight;

let api: { stuck: boolean; follow: () => void };
function Harness() {
	const { ref, stuck, follow } = useStickToBottom<HTMLDivElement>();
	useEffect(() => {
		api = { stuck, follow };
	});
	return <div ref={ref}>transcript</div>;
}

let root: Root;
beforeEach(() => {
	geometry.scrollHeight = 1000;
	scroller.scrollTop = 0;
	root = createRoot(scroller);
	act(() => root.render(<Harness />));
});
afterEach(() => act(() => root.unmount()));

const firstLayout = () => act(resize);
const userScrollsTo = (top: number) =>
	act(() => {
		scroller.scrollTop = top;
		scroller.dispatchEvent(new Event("scroll"));
	});
const contentGrowsBy = (px: number) =>
	act(() => {
		geometry.scrollHeight += px;
		resize();
	});
const smoothFollowFrom = (top: number) => {
	userScrollsTo(top);
	vi.spyOn(scroller, "scrollTo").mockImplementation(() => {});
	act(() => api.follow());
};

describe("useStickToBottom", () => {
	it("opens at the bottom and follows growth while there", () => {
		firstLayout();
		expect(scroller.scrollTop).toBe(1000);
		expect(api.stuck).toBe(true);

		userScrollsTo(bottom());
		contentGrowsBy(200);

		expect(scroller.scrollTop).toBe(1200);
		expect(api.stuck).toBe(true);
	});

	it("stops following once the user scrolls up", () => {
		userScrollsTo(bottom());
		userScrollsTo(100);
		expect(api.stuck).toBe(false);

		contentGrowsBy(200);

		expect(scroller.scrollTop).toBe(100);
		expect(api.stuck).toBe(false);
	});

	it("resumes only once the user is back within a few px of the bottom", () => {
		userScrollsTo(bottom());
		userScrollsTo(100);

		userScrollsTo(bottom() - 50);
		expect(api.stuck).toBe(false);

		userScrollsTo(bottom() - 4);
		expect(api.stuck).toBe(true);
		contentGrowsBy(50);
		expect(scroller.scrollTop).toBe(geometry.scrollHeight);
	});

	it("follow jumps to the bottom and holds through the smooth scroll", () => {
		smoothFollowFrom(100);
		expect(scroller.scrollTo).toHaveBeenCalledWith({
			top: 1000,
			behavior: "smooth",
		});
		expect(api.stuck).toBe(true);

		userScrollsTo(400);
		expect(api.stuck).toBe(true);

		userScrollsTo(bottom());
		expect(api.stuck).toBe(true);
	});

	it("lets the user interrupt a smooth follow by scrolling up", () => {
		smoothFollowFrom(100);

		userScrollsTo(400);
		userScrollsTo(350);

		expect(api.stuck).toBe(false);
	});
});
