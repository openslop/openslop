// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Editable, type RenderElementProps } from "slate-react";
import { toast } from "sonner";
import { isContentElement } from "@/lib/canvas/guards";
import { ELEMENT_CONFIGS } from "../element-configs";
import { click, mountOnCanvas } from "@/app/components/canvas/__tests__/_mount";
import { content, scene } from "@/app/components/canvas/__tests__/fixtures";
import { ElementErrorBoundary } from "../element-error-boundary";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let brokenId: string | null;

function Card({ attributes, element, children }: RenderElementProps) {
	if (element.id === brokenId) throw new Error("card crashed");
	return (
		<div {...attributes} data-card={element.id}>
			{children}
		</div>
	);
}

function renderElement(props: RenderElementProps) {
	if (!isContentElement(props.element))
		return <div {...props.attributes}>{props.children}</div>;
	return (
		<ElementErrorBoundary
			label={ELEMENT_CONFIGS[props.element.type].label}
			attributes={props.attributes}
			leaves={props.children}
		>
			<Card {...props} />
		</ElementErrorBoundary>
	);
}

const script = [
	scene([
		content("narration", "good", "still here"),
		content("image", "bad", "a broken card"),
	]),
];

let canvas: ReturnType<typeof mountOnCanvas>;

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
	brokenId = "bad";
	canvas = mountOnCanvas(script);
	canvas.render(<Editable renderElement={renderElement} />);
});

afterEach(() => {
	canvas.unmount();
});

const query = (selector: string) => document.body.querySelector(selector);

describe("ElementErrorBoundary", () => {
	it("keeps the other cards and the editor when one card throws", () => {
		expect(query('[data-card="good"]')?.textContent).toBe("still here");
		expect(query('[role="alert"]')?.textContent).toContain(
			"Image failed to render.",
		);
		expect(query('[data-card="bad"]')).toBeNull();
		expect(query("[data-slate-editor]")).not.toBeNull();
		expect(toast.error).toHaveBeenCalledOnce();
	});

	it("keeps the broken element's text in the DOM for Slate", () => {
		const fallback = query('[role="alert"]')?.parentElement;
		expect(fallback?.getAttribute("data-slate-node")).toBe("element");
		expect(fallback?.querySelector("[data-slate-string]")?.textContent).toBe(
			"a broken card",
		);
	});

	it("renders the card again on Try again", async () => {
		brokenId = null;
		await click("button");
		expect(query('[role="alert"]')).toBeNull();
		expect(query('[data-card="bad"]')?.textContent).toBe("a broken card");
	});
});
