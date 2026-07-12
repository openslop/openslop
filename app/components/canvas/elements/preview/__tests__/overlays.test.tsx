import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlaceholderOverlay } from "../overlays";

const renderOverlay = (cancelClassName?: string) =>
	renderToStaticMarkup(
		<TooltipProvider>
			<PlaceholderOverlay
				status="generating"
				seconds={1}
				error={null}
				onDiscard={() => {}}
				cancelClassName={cancelClassName}
			/>
		</TooltipProvider>,
	);

// The GenerationIndicator sibling also carries a "top-2" class, so scope
// the assertion to the cancel button itself rather than the whole markup.
const cancelButtonClass = (html: string) => {
	const match = html.match(/aria-label="Cancel generation" class="([^"]*)"/);
	if (!match) throw new Error("cancel button not found in rendered markup");
	return match[1];
};

describe("PlaceholderOverlay cancelClassName", () => {
	it("positions the cancel button with the default class when unset", () => {
		expect(cancelButtonClass(renderOverlay())).toContain("top-2");
	});

	it("overrides the cancel button position via cancelClassName", () => {
		const className = cancelButtonClass(renderOverlay("top-10"));
		expect(className).toContain("top-10");
		expect(className).not.toContain("top-2");
	});
});
