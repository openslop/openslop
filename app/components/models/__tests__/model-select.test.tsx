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
