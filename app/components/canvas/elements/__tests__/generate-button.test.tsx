// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StaleIndicator } from "../generate-button";

const spokenText = (node: React.ReactNode) => {
	const container = document.createElement("div");
	container.innerHTML = renderToStaticMarkup(
		<TooltipProvider>{node}</TooltipProvider>,
	);
	container
		.querySelectorAll('[aria-hidden="true"]')
		.forEach((hidden) => hidden.remove());
	return container.textContent;
};

describe("StaleIndicator", () => {
	it("tells a screen reader why the element is stale, not only that it is", () => {
		const reason = "The prompt changed — regenerate to update";
		expect(spokenText(<StaleIndicator reason={reason} />)).toBe(
			`Stale: ${reason}`,
		);
	});
});
