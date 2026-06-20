import { describe, expect, it, vi } from "vitest";
import { GatewayClient } from "@/lib/gateway/base";
import { createReferenceStylePlugin } from "@/lib/connectors/llm/plugins/reference-style";
import { clearProjectStore, getProjectStore } from "@/lib/project/store";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	PluginContext,
} from "../types";

class MockLLMGateway extends GatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	generate = vi.fn(
		async (_params: LLMGenerateParams): Promise<LLMGenerateResult> => ({
			text: "Soft watercolor, pastel palette, dreamy lighting.",
			model: "test",
		}),
	);
}

function setup(projectId: string, referenceImages: string[]) {
	clearProjectStore(projectId);
	getProjectStore(projectId).getState().setReferenceImages(referenceImages);
	const gateway = new MockLLMGateway();
	const plugin = createReferenceStylePlugin(projectId);
	if (!plugin.transformPrompt)
		throw new Error("reference-style plugin must define transformPrompt");
	const ctx: PluginContext<LLMGenerateParams, LLMGenerateResult> = { gateway };
	return { gateway, transformPrompt: plugin.transformPrompt, ctx };
}

describe("createReferenceStylePlugin", () => {
	it("returns the prompt unchanged and skips gateway when no images are present", async () => {
		const { gateway, transformPrompt, ctx } = setup("p1", []);
		const result = await transformPrompt("a knight and a dragon", ctx);
		expect(result).toBe("a knight and a dragon");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("calls the gateway with the reference images and prepends the style description", async () => {
		const images = ["https://example.com/a.jpg", "https://example.com/b.jpg"];
		const { gateway, transformPrompt, ctx } = setup("p2", images);

		const result = await transformPrompt("a knight and a dragon", ctx);

		expect(gateway.generate).toHaveBeenCalledOnce();
		const call = gateway.generate.mock.calls[0][0];
		expect(call.referenceImages).toEqual(images);
		expect(call.prompt).toMatch(/describe the visual art style/i);
		expect(result).toMatch(
			/^Art style reference: Soft watercolor, pastel palette, dreamy lighting\./,
		);
		expect(result).toContain("a knight and a dragon");
	});

	it("filters empty reference image slots before deciding whether to call the gateway", async () => {
		const { gateway, transformPrompt, ctx } = setup("p-empty", [""]);

		const result = await transformPrompt("a knight and a dragon", ctx);

		expect(result).toBe("a knight and a dragon");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("combines reference images with uploaded avatars but excludes generated ones", async () => {
		const projectId = "p4";
		const referenceImage = "https://example.com/reference.jpg";
		const uploadedAvatar = "https://example.com/uploaded-avatar.jpg";
		const generatedAvatar = "https://example.com/generated-avatar.jpg";
		const { gateway, transformPrompt, ctx } = setup(projectId, [
			referenceImage,
		]);
		const store = getProjectStore(projectId);
		store.getState().setCharacter("Mira", {
			appearance: "blue hair",
			avatarUrl: uploadedAvatar,
			avatarUploaded: true,
		});
		store.getState().setCharacter("Generated", {
			appearance: "green hair",
			avatarUrl: generatedAvatar,
			avatarUploaded: false,
		});

		const result = await transformPrompt("a knight and a dragon", ctx);

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(gateway.generate.mock.calls[0][0].referenceImages).toEqual([
			referenceImage,
			uploadedAvatar,
		]);
		expect(result).toMatch(
			/^Art style reference: Soft watercolor, pastel palette, dreamy lighting\./,
		);
	});

	it("uses uploaded character avatars as style references when no reference images are present", async () => {
		const projectId = "p5";
		const avatar = "https://example.com/avatar.jpg";
		const { gateway, transformPrompt, ctx } = setup(projectId, []);
		getProjectStore(projectId).getState().setCharacter("Mira", {
			appearance: "blue hair",
			avatarUrl: avatar,
			avatarUploaded: true,
		});

		await transformPrompt("a knight and a dragon", ctx);

		expect(gateway.generate).toHaveBeenCalledOnce();
		expect(gateway.generate.mock.calls[0][0].referenceImages).toEqual([avatar]);
	});

	it("ignores generated avatars to avoid circular style references", async () => {
		const projectId = "p6";
		const { gateway, transformPrompt, ctx } = setup(projectId, []);
		getProjectStore(projectId).getState().setCharacter("Generated", {
			appearance: "green hair",
			avatarUrl: "https://example.com/generated-avatar.jpg",
			avatarUploaded: false,
		});

		const result = await transformPrompt("a knight and a dragon", ctx);

		expect(result).toBe("a knight and a dragon");
		expect(gateway.generate).not.toHaveBeenCalled();
	});

	it("throws when no gateway is provided", async () => {
		const { transformPrompt } = setup("p3", ["https://example.com/a.jpg"]);
		await expect(transformPrompt("hi")).rejects.toThrow(
			"reference-style plugin requires gateway context",
		);
	});
});
