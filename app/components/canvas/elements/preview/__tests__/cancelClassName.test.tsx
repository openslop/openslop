import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedImagePreview } from "../AnimatedImagePreview";
import { MediaResult } from "../results";

const withTooltip = (node: React.ReactNode) =>
	renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>);

// The GenerationIndicator sibling also carries a "top-2" class, so scope
// the assertion to the cancel button itself rather than the whole markup.
const cancelButtonClass = (html: string) => {
	const match = html.match(/aria-label="Cancel generation" class="([^"]*)"/);
	if (!match) throw new Error("cancel button not found in rendered markup");
	return match[1];
};

describe("MediaResult cancelClassName forwarding", () => {
	it("defaults to top-2 when cancelClassName is unset", () => {
		const html = withTooltip(
			<MediaResult
				url={undefined}
				outputKind="image"
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
			<MediaResult
				url={undefined}
				outputKind="image"
				status="generating"
				seconds={1}
				error={null}
				onDiscard={() => {}}
				cancelClassName="top-10"
			/>,
		);
		expect(cancelButtonClass(html)).toContain("top-10");
	});

	it("renders the media instead of the placeholder once a url arrives", () => {
		const html = withTooltip(
			<MediaResult
				url="https://cdn.example.com/a.png"
				outputKind="image"
				status="idle"
				seconds={0}
				error={null}
				onDiscard={() => {}}
			/>,
		);
		expect(html).not.toContain('aria-label="Cancel generation"');
		expect(html).toContain("https://cdn.example.com/a.png");
	});
});

const mediaToggleClass = (html: string) => {
	const match = html.match(/class="([^"]*bg-media-toggle-bg[^"]*)"/);
	if (!match) throw new Error("media toggle not found in rendered markup");
	return match[1];
};

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

	it("stacks the still/video toggle above the error overlay so it stays clickable", () => {
		const html = withTooltip(
			<AnimatedImagePreview
				status="idle"
				seconds={0}
				error="generation failed"
				onDiscard={() => {}}
			/>,
		);
		// Error overlay renders at z-20; the toggle must sit above it.
		expect(html).toContain("z-20");
		expect(mediaToggleClass(html)).toContain("z-30");
	});
});
