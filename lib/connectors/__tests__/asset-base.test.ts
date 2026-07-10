import { describe, expect, it, vi, beforeEach } from "vitest";
import { BaseAssetConnector } from "../asset-base";
import { AssetBundle } from "@/lib/api/asset-bundle";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { AssetGateway, JobPoll } from "@/lib/gateway/base";
import type { ConnectorConfig, ConnectorType } from "../types";

type TestParams = { prompt: string };
type TestResult = { imageUrl?: string; durationSec: number };

function makeGateway(
	generateImpl: (params: TestParams) => Promise<BundleResponse>,
): AssetGateway<TestParams> {
	const generate = vi.fn(async (params: TestParams) => {
		// Eagerly run the underlying op so errors surface and results cache.
		const result = await generateImpl(params);
		return {
			jobId: result.id || "job",
			status: "pending" as const,
			_result: result,
		};
	});
	return {
		generate: async (params) => {
			const r = await generate(params);
			return { jobId: r.jobId, status: r.status };
		},
		poll: async (): Promise<JobPoll> => {
			const firstCall = generate.mock.results[0];
			if (!firstCall) throw new Error("generate was not called");
			const r = await firstCall.value;
			return {
				jobId: r.jobId,
				status: "completed",
				result: r._result as BundleResponse,
				error: null,
			};
		},
	};
}

function makeFailingGateway(poll: JobPoll): AssetGateway<TestParams> {
	return {
		generate: async () => ({ jobId: "job", status: "pending" }),
		poll: async () => poll,
	};
}

class TestAssetConnector extends BaseAssetConnector<TestParams, TestResult> {
	readonly type: ConnectorType = "image";
	readonly assetKey = "image";

	constructor(
		config: ConnectorConfig,
		generateFn?: (params: TestParams) => Promise<BundleResponse>,
	) {
		super(
			makeGateway(
				generateFn ?? (async () => ({ id: "x", provider: "mock", result: {} })),
			),
			config,
		);
	}
}

class GatewayAssetConnector extends BaseAssetConnector<TestParams, TestResult> {
	readonly type: ConnectorType = "video";
	readonly assetKey = "video";

	constructor(config: ConnectorConfig, gateway: AssetGateway<TestParams>) {
		super(gateway, config);
	}
}

const config: ConnectorConfig = {
	defaultModel: "test-model",
	models: ["test-model"],
	isDefault: true,
};

describe("BaseAssetConnector", () => {
	beforeEach(() => {
		AssetBundle.baseUrl = "https://blob.example.com";
	});

	describe("resolveBundle", () => {
		it("resolves asset url and duration from bundle", async () => {
			const connector = new TestAssetConnector(config);
			const bundle = new AssetBundle(
				"https://blob.example.com/assets/image/runware/abc",
				{
					version: 1,
					type: "image",
					createdAt: "",
					result: { image: "output.png" },
					metadata: { durationSec: 10 },
				},
			);

			const result = await connector.resolveBundle(bundle);
			expect(result).toEqual({
				imageUrl:
					"https://blob.example.com/assets/image/runware/abc/output.png",
				durationSec: 10,
			});
		});

		it("defaults duration to 0 when metadata is missing", async () => {
			const connector = new TestAssetConnector(config);
			const bundle = new AssetBundle(
				"https://blob.example.com/assets/image/mock/xyz",
				{
					version: 1,
					type: "image",
					createdAt: "",
					result: { image: "output.jpg" },
				},
			);

			const result = await connector.resolveBundle(bundle);
			expect(result.durationSec).toBe(0);
		});

		it("defaults duration to 0 when durationSec is missing from metadata", async () => {
			const connector = new TestAssetConnector(config);
			const bundle = new AssetBundle(
				"https://blob.example.com/assets/image/mock/xyz",
				{
					version: 1,
					type: "image",
					createdAt: "",
					result: { image: "output.jpg" },
					metadata: { otherField: "value" },
				},
			);

			const result = await connector.resolveBundle(bundle);
			expect(result.durationSec).toBe(0);
		});
	});

	describe("_generate (via generate)", () => {
		it("submits then polls the gateway and resolves the bundle", async () => {
			const response: BundleResponse = {
				id: "abc",
				provider: "mock",
				result: { image: "output.png" },
				metadata: { durationSec: 5 },
			};
			const generateFn = vi.fn().mockResolvedValue(response);
			const connector = new TestAssetConnector(config, generateFn);

			const result = await connector.generate({ prompt: "test" });

			expect(generateFn).toHaveBeenCalledWith({ prompt: "test" });
			expect(result.imageUrl).toBe(
				"https://blob.example.com/assets/image/mock/abc/output.png",
			);
			expect(result.durationSec).toBe(5);
		});

		it("propagates gateway errors", async () => {
			const generateFn = vi.fn().mockRejectedValue(new Error("gateway failed"));
			const connector = new TestAssetConnector(config, generateFn);

			await expect(connector.generate({ prompt: "test" })).rejects.toThrow(
				"gateway failed",
			);
		});

		it("throws with the poll's errorDetail as cause when the job fails", async () => {
			const errorDetail = { error: { code: "invalidValueUploadFailed" } };
			const connector = new GatewayAssetConnector(
				config,
				makeFailingGateway({
					jobId: "job",
					status: "failed",
					result: null,
					error: "Processing failed",
					errorDetail,
				}),
			);

			try {
				await connector.generate({ prompt: "test" });
				expect.unreachable();
			} catch (err) {
				expect((err as Error).message).toBe("Processing failed");
				expect((err as Error).cause).toBe(errorDetail);
			}
		});

		it("has an undefined cause when the poll result carries no errorDetail", async () => {
			const connector = new GatewayAssetConnector(
				config,
				makeFailingGateway({
					jobId: "job",
					status: "failed",
					result: null,
					error: "Processing failed",
				}),
			);

			try {
				await connector.generate({ prompt: "test" });
				expect.unreachable();
			} catch (err) {
				expect((err as Error).cause).toBeUndefined();
			}
		});

		it("handles external urls in bundle response", async () => {
			const response: BundleResponse = {
				id: "xyz",
				provider: "runware",
				result: { image: "https://cdn.example.com/image.webp" },
			};
			const generateFn = vi.fn().mockResolvedValue(response);
			const connector = new TestAssetConnector(config, generateFn);

			const result = await connector.generate({ prompt: "test" });
			expect(result.imageUrl).toBe("https://cdn.example.com/image.webp");
			expect(result.durationSec).toBe(0);
		});
	});
});
