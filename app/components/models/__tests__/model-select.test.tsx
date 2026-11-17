import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConnectHint } from "../model-select";

const render = (provider: Parameters<typeof ConnectHint>[0]["provider"]) =>
	renderToStaticMarkup(
		<TooltipProvider>
			<ConnectHint provider={provider} />
		</TooltipProvider>,
	);

describe("ConnectHint", () => {
	it("uses the design system's icon chip, not a hand-styled button span", () => {
		const html = render("anthropic");
		// IconChip renders a size="icon" Badge (size-6 rounded-md, icon at size-4).
		expect(html).toContain("size-6 rounded-md p-0");
		expect(html).not.toContain("text-label-xs");
		expect(html).not.toContain("px-1.5");
	});

	it("announces the provider through the API-key label, with no visible Connect text", () => {
		const html = render("anthropic");
		expect(html).toContain(
			"Add your Anthropic API key to generate with this model",
		);
		expect(html).not.toContain(">Connect<");
	});

	it("stays non-interactive so it never nests a button inside a menu row", () => {
		expect(render("anthropic")).not.toContain("<button");
	});
});
