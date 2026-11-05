// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PINNED_PANEL_KEYS, RAIL_PANEL_GROUPS } from "../panel-keys";
import { Rail } from "../rail";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	container = document.body.appendChild(document.createElement("div"));
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const Item = ({ panelKey }: { panelKey: string }) => (
	<button type="button" aria-label={panelKey} />
);

const labels = (scope: ParentNode) =>
	Array.from(scope.querySelectorAll("button"), (node) =>
		node.getAttribute("aria-label"),
	);

const slot = (name: string) => {
	const node = container.querySelector(`[data-slot="${name}"]`);
	if (!node) throw new Error(`no ${name}`);
	return node;
};

describe("Rail", () => {
	it("draws home, then every panel group in a body that scrolls, then the pinned panels in a fixed foot", () => {
		act(() =>
			root.render(
				<Rail home={<button type="button" aria-label="Home" />} Item={Item} />,
			),
		);

		expect(labels(container)).toEqual([
			"Home",
			...RAIL_PANEL_GROUPS.flat(),
			...PINNED_PANEL_KEYS,
		]);
		expect(labels(slot("rail-body"))).toEqual(RAIL_PANEL_GROUPS.flat());
		expect(labels(slot("rail-foot"))).toEqual([...PINNED_PANEL_KEYS]);
	});
});
