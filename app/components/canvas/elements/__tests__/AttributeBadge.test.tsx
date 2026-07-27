import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { AttributeBadge } from "../AttributeBadge";

const elementWith = (
	customAttributes: Record<string, string>,
): CanvasContentElement =>
	({
		id: "el",
		type: "animated_image",
		customAttributes,
		children: [{ id: "text", type: "animated_image", text: "" }],
	}) as unknown as CanvasContentElement;

const motionSpec: AttributeSpec = {
	label: "Motion",
	edit: { kind: "enum", options: ["none", "zoom_in"] },
	default: "none",
};

function render(element: CanvasContentElement, spec: AttributeSpec) {
	const editor = withReact(createEditor());
	return renderToStaticMarkup(
		<Slate editor={editor} initialValue={[element as never]}>
			<Editable />
			<AttributeBadge element={element} attrKey="motion" spec={spec} />
		</Slate>,
	);
}

const control = (html: string) =>
	html.match(/aria-label="Motion: ([^"]*)"/)?.[1];

describe("AttributeBadge", () => {
	it("shows the schema default when the attribute key is absent", () => {
		expect(control(render(elementWith({}), motionSpec))).toBe("none");
	});

	it("shows the element's own value over the default", () => {
		expect(
			control(render(elementWith({ motion: "zoom_in" }), motionSpec)),
		).toBe("zoom_in");
	});

	it("keeps an enum editable when it has neither a value nor a default", () => {
		const { default: _default, ...noDefault } = motionSpec;
		expect(control(render(elementWith({}), noDefault))).toBe("");
	});

	it("renders nothing with no value, no default and no edit affordance", () => {
		expect(render(elementWith({}), { label: "Motion" })).not.toContain(
			"Motion",
		);
	});
});
