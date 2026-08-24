import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedImageMedia } from "../AnimatedImagePreview";
import { PreviewChrome } from "../overlays";
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

	it("is pushed below the still/video toggle by AnimatedImageMedia", () => {
		const html = withTooltip(
			<AnimatedImageMedia
				onDiscard={() => {}}
				animated={{ ...generating, url: undefined }}
				still={{ ...generating, url: undefined }}
			/>,
		);
		expect(html).toContain("--cancel-offset:2.5rem");
	});

	it("is centred in the audio placeholder's shorter track", () => {
		const html = withTooltip(<AudioPlaceholder {...generating} />);
		expect(html).toContain("--cancel-offset:calc(50% - 0.75rem)");
	});
});

describe("PreviewChrome", () => {
	it("stacks its corner above the error overlay so it stays clickable", () => {
		// The error overlay renders at z-20; chrome must sit above it.
		const html = withTooltip(<PreviewChrome topRight={<span>badge</span>} />);
		expect(html).toContain("z-30");
		expect(html).toContain("badge");
	});
});

describe("AnimatedImageMedia", () => {
	const failed = {
		status: "idle",
		seconds: 0,
		error: "generation failed",
		url: undefined,
	} as const;

	it("keeps the still/video toggle reachable over a failed generation", () => {
		const html = withTooltip(
			<AnimatedImageMedia
				onDiscard={() => {}}
				animated={failed}
				still={failed}
			/>,
		);
		expect(html).toContain("z-20");
		expect(html).toContain("bg-media-toggle-bg");
	});
});
