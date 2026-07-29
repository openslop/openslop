import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedImagePreview } from "../AnimatedImagePreview";
import { AudioPlaceholder, MediaResult } from "../results";

const withTooltip = (node: React.ReactNode) =>
	renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>);

// The GenerationIndicator sibling also carries a "top-*" class, so scope
// the assertion to the cancel button itself rather than the whole markup.
const cancelButtonClass = (html: string) => {
	const match = html.match(/aria-label="Cancel generation" class="([^"]*)"/);
	if (!match) throw new Error("cancel button not found in rendered markup");
	return match[1];
};

const generating = {
	status: "generating",
	seconds: 1,
	error: null,
	onDiscard: () => {},
} as const;

describe("cancel button offset", () => {
	it("reads its vertical offset from --cancel-offset", () => {
		const html = withTooltip(
			<MediaResult {...generating} url={undefined} outputKind="image" />,
		);
		expect(cancelButtonClass(html)).toContain(
			"top-[var(--cancel-offset,0.5rem)]",
		);
	});

	it("renders the media instead of the placeholder once a url arrives", () => {
		const html = withTooltip(
			<MediaResult
				status="idle"
				seconds={0}
				error={null}
				onDiscard={() => {}}
				url="https://cdn.example.com/a.png"
				outputKind="image"
			/>,
		);
		expect(html).not.toContain('aria-label="Cancel generation"');
		expect(html).toContain("https://cdn.example.com/a.png");
	});

	it("is pushed below the still/video toggle by AnimatedImagePreview", () => {
		const html = withTooltip(
			<AnimatedImagePreview {...generating} result={null} />,
		);
		expect(html).toContain("--cancel-offset:2.5rem");
	});

	it("is centred in the audio placeholder's shorter track", () => {
		const html = withTooltip(<AudioPlaceholder {...generating} />);
		expect(html).toContain("--cancel-offset:calc(50% - 0.75rem)");
	});
});

const mediaToggleClass = (html: string) => {
	const match = html.match(/class="([^"]*bg-media-toggle-bg[^"]*)"/);
	if (!match) throw new Error("media toggle not found in rendered markup");
	return match[1];
};

describe("AnimatedImagePreview", () => {
	it("stacks the still/video toggle above the error overlay so it stays clickable", () => {
		const html = withTooltip(
			<AnimatedImagePreview
				status="idle"
				seconds={0}
				error="generation failed"
				onDiscard={() => {}}
				result={null}
			/>,
		);
		// Error overlay renders at z-20; the toggle must sit above it.
		expect(html).toContain("z-20");
		expect(mediaToggleClass(html)).toContain("z-30");
	});
});
