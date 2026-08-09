import { describe, expect, it, vi } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { createReferenceStylePlugin } from "@/lib/connectors/llm/plugins/reference-style";
import { createProjectStore } from "@/lib/project/store";
import { stubAvatarResults } from "./_node-results";
import { stateCtx } from "./_state-ctx";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	PluginContext,
} from "../types";

const DERIVED = "Soft watercolor, pastel palette, dreamy lighting.";

class MockLLMGateway extends GatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	generate = vi.fn(
		async (): Promise<LLMGenerateResult> => ({ text: DERIVED, model: "test" }),
	);
}

function setup(referenceImages: string[] = []) {
	const store = createProjectStore();
	store.getState().setReferenceImages(referenceImages);
	const gateway = new MockLLMGateway();
	const { transformPrompt } = createReferenceStylePlugin(
		store,
		stubAvatarResults({}),
	);
	if (!transformPrompt)
		throw new Error("reference-style plugin must define transformPrompt");
	// Built per call: the plugin reads the state its caller hands it, which
	// changes as the plugin itself writes to the store.
	const ctx = (): PluginContext<LLMGenerateParams, LLMGenerateResult> => ({
		gateway,
		...stateCtx(store),
	});
	const style = () => store.getState().metadata.style;
	return { store, gateway, transformPrompt, ctx, style };
}

describe("createReferenceStylePlugin", () => {
	it("stores a style derived from the references", async () => {
		const { gateway, transformPrompt, ctx, style } = setup([
			"https://example.com/a.jpg",
		]);

		await transformPrompt("a knight and a dragon", ctx());

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(style()).toBe(DERIVED);
	});

	// projectMetadata injects from the pre-run state snapshot, which cannot hold
	// a style written during this run, so the model would otherwise never see it.
	it("prepends the derived style, which the run's snapshot cannot carry", async () => {
		const { transformPrompt, ctx } = setup(["https://example.com/a.jpg"]);

		const result = await transformPrompt("a knight and a dragon", ctx());

		expect(result).toBe(
			`Art style reference: ${DERIVED}\n\na knight and a dragon`,
		);
	});

	it("leaves a style the user set alone", async () => {
		const { store, gateway, transformPrompt, ctx, style } = setup([
			"https://example.com/a.jpg",
		]);
		store.getState().updateMetadata({ style: "Oil painting --ar 16:9" });

		const result = await transformPrompt("a knight and a dragon", ctx());

		expect(gateway.generate).not.toHaveBeenCalled();
		expect(style()).toBe("Oil painting --ar 16:9");
		// projectMetadata injects a stored style; prepending would send it twice.
		expect(result).toBe("a knight and a dragon");
	});

	it("skips the gateway when there are no references to read", async () => {
		const { gateway, transformPrompt, ctx, style } = setup();

		const result = await transformPrompt("a knight and a dragon", ctx());

		expect(gateway.generate).not.toHaveBeenCalled();
		expect(style()).toBe("");
		expect(result).toBe("a knight and a dragon");
	});

	it("throws when no gateway is provided", async () => {
		const { store, transformPrompt } = setup(["https://example.com/a.jpg"]);
		await expect(transformPrompt("hi", stateCtx(store))).rejects.toThrow(
			"reference-style plugin requires gateway context",
		);
	});
});
