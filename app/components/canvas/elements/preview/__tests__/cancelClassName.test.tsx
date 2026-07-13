import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedImagePreview } from "../AnimatedImagePreview";
import { MediaPlaceholder } from "../results";

const withTooltip = (node: React.ReactNode) =>
	renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>);

// The GenerationIndicator sibling also carries a "top-2" class, so scope
// the assertion to the cancel button itself rather than the whole markup.
const cancelButtonClass = (html: string) => {
	const match = html.match(/aria-label="Cancel generation" class="([^"]*)"/);
	if (!match) throw new Error("cancel button not found in rendered markup");
	return match[1];
};

describe("MediaPlaceholder cancelClassName forwarding", () => {
	it("defaults to top-2 when cancelClassName is unset", () => {
		const html = withTooltip(
			<MediaPlaceholder
				status="generating"
				seconds={1}
				error={null}
				onDiscard={() => {}}
			/>,
		);
		expect(cancelButtonClass(html)).toContain("top-2");
	});

	it("forwards cancelClassName through to the cancel button", () => {
		const html = withTooltip(
			<MediaPlaceholder
				status="generating"
				seconds={1}
				error={null}
				onDiscard={() => {}}
				cancelClassName="top-10"
			/>,
		);
		expect(cancelButtonClass(html)).toContain("top-10");
	});
});

describe("AnimatedImagePreview", () => {
	it("positions the cancel button below the still/video toggle while generating", () => {
		const html = withTooltip(
			<AnimatedImagePreview
				status="generating"
				seconds={1}
				error={null}
				onDiscard={() => {}}
			/>,
		);
		const className = cancelButtonClass(html);
		expect(className).toContain("top-10");
		expect(className).not.toContain("top-2");
	});
});
