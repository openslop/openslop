// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { TEMPLATES } from "@/lib/templates/templates";
import TemplateGallery from "../template-gallery";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

it("shows every template and selects its id and example prompt", async () => {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	const onSelect = vi.fn();
	try {
		await act(() => root.render(<TemplateGallery onSelect={onSelect} />));
		const cards = Array.from(container.querySelectorAll("button"));
		expect(cards).toHaveLength(TEMPLATES.length);
		for (const [index, template] of TEMPLATES.entries()) {
			const card = cards[index];
			if (!card) throw new Error(`Missing gallery card for ${template.id}`);
			expect(card.textContent).toContain(template.name);
			expect(card.textContent).toContain(template.showcase.description);
			expect(card.querySelector("img")?.alt).toBe(template.showcase.title);
			await act(() => card.click());
			expect(onSelect).toHaveBeenLastCalledWith(
				template.id,
				template.showcase.examplePrompt,
			);
		}
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});
