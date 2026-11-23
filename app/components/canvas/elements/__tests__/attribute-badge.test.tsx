import { z } from "zod";
import { Image } from "@/components/ui/icon";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import {
	durationDef,
	loopsDef,
	trimEndDef,
	volumeDef,
} from "@/lib/connectors/attributes/common";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import type { ContentElement } from "@/lib/canvas/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AttributeBadge } from "../attribute-badge";
import { element } from "@/lib/canvas/__tests__/_assets";

const elementWith = (attributes: Record<string, string>) =>
	element("el", "video", "", attributes);

const motionDef: AttributeDef = {
	key: "motion",
	label: "Motion",
	edit: { kind: "enum", value: z.enum(["none", "zoom_in"]), icon: Image },
};

function render(element: ContentElement, def: AttributeDef) {
	const editor = withReact(createEditor());
	return renderToStaticMarkup(
		<TooltipProvider>
			<Slate editor={editor} initialValue={[element as never]}>
				<Editable />
				<AttributeBadge element={element} def={def} />
			</Slate>
		</TooltipProvider>,
	);
}

const control = (html: string) =>
	html.match(/aria-label="[^:]+: ([^"]*)"/)?.[1];

describe("AttributeBadge", () => {
	it("stays editable when the attribute key is absent", () => {
		const html = render(elementWith({}), motionDef);
		expect(html).toContain("aria-label");
		expect(control(html)).toBe("—");
	});

	it("shows the element's own value", () => {
		expect(control(render(elementWith({ motion: "zoom_in" }), motionDef))).toBe(
			"zoom_in",
		);
	});

	it("never presents a value the element does not have", () => {
		expect(control(render(elementWith({}), motionDef))).not.toBe("none");
	});

	it("omits the unit suffix when there is no value", () => {
		const durationDef: AttributeDef = {
			key: "duration",
			label: "Duration",
			unit: "s",
			edit: { kind: "enum", value: z.enum(["5", "10"]), icon: Image },
		};
		const html = render(elementWith({}), durationDef);
		expect(control(html)).toBe("—");
		expect(html).not.toContain(">s<");
	});

	it("renders nothing for an attribute with no control", () => {
		expect(
			render(elementWith({ motion: "zoom_in" }), {
				key: "motion",
				label: "Motion",
			}),
		).not.toContain("zoom_in");
	});

	describe("seconds", () => {
		const reset = (html: string) =>
			html.match(/<button[^>]*aria-label="Reset trim end"[^>]*>/)?.[0];

		it("offers a reset once the field holds a value", () => {
			const html = render(elementWith({ trimEnd: "4" }), trimEndDef);
			expect(reset(html)).toBeDefined();
		});

		it("has nothing to reset while the field is on Auto", () => {
			const html = render(elementWith({}), trimEndDef);
			expect(reset(html)).toBeUndefined();
		});
	});

	describe("range", () => {
		const thumb = (html: string) =>
			html.match(/<span[^>]*role="slider"[^>]*>/)?.[0] ?? "";

		it("is a slider named for the attribute, not a menu", () => {
			const html = render(elementWith({ volume: "7" }), volumeDef("5"));
			expect(thumb(html)).toContain('aria-label="Volume"');
			expect(html).not.toContain('aria-haspopup="menu"');
		});

		it("reads out the value with its unit", () => {
			const html = render(elementWith({ duration: "12" }), durationDef(15));
			expect(thumb(html)).toContain('aria-valuemax="15"');
			expect(html).toMatch(/font-numeric[^>]*>12s</);
		});

		it("reads out nothing while the element has no value", () => {
			expect(render(elementWith({}), volumeDef("5"))).toMatch(
				/font-numeric[^>]*>—</,
			);
		});
	});

	describe("count", () => {
		const spinbutton = (html: string) =>
			html.match(/<div[^>]*role="spinbutton"[^>]*>/)?.[0] ?? "";

		it("is a number field with a floor and no ceiling", () => {
			const html = spinbutton(render(elementWith({ loops: "12" }), loopsDef));
			expect(html).toContain('aria-label="Loops"');
			expect(html).toContain('aria-valuenow="12"');
			expect(html).toContain('aria-valuemin="1"');
			expect(html).not.toContain("aria-valuemax");
		});

		it("shows the default while the element has no value", () => {
			const html = spinbutton(render(elementWith({}), loopsDef));
			expect(html).toContain('aria-valuenow="1"');
		});
	});
});
