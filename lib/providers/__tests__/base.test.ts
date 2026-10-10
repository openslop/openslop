import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

import { AssetBundle } from "@/lib/api/asset-bundle";
import { BaseProvider, type WithMetadata } from "../base";
import type { BundleFile } from "@/lib/api/asset-bundle";

type TestParams = { prompt: string; size?: number };
type TestRawResult = { data: string } & WithMetadata;

class TestProvider extends BaseProvider<TestParams, TestRawResult> {
	protected readonly blobConfig = { type: "test", provider: "mock" };
	generateFn = vi.fn<(params: TestParams) => Promise<TestRawResult>>();

	async validate() {
		return { ok: true as const };
	}

	protected toFiles(r: TestRawResult): BundleFile[] {
		return [
			{
				key: "output",
				filename: "out.bin",
				data: r.data,
				contentType: "application/octet-stream",
			},
		];
	}

	protected async _generate(params: TestParams): Promise<TestRawResult> {
		return this.generateFn(params);
	}
}

describe("BaseProvider", () => {
	let provider: TestProvider;

	beforeEach(() => {
		vi.clearAllMocks();
		provider = new TestProvider();
	});

	it("calls _generate then store (upload)", async () => {
		provider.generateFn.mockResolvedValue({ data: "abc" });

		const result = await provider.generate({ prompt: "hello" });

		expect(provider.generateFn).toHaveBeenCalledWith({ prompt: "hello" });
		expect(AssetBundle.upload).toHaveBeenCalledWith(
			"test",
			"mock",
			[
				{
					key: "output",
					filename: "out.bin",
					data: "abc",
					contentType: "application/octet-stream",
				},
			],
			undefined,
		);
		expect(result).toEqual(
			expect.objectContaining({ provider: "mock", result: { output: "url" } }),
		);
	});

	it("forwards metadata to upload", async () => {
		provider.generateFn.mockResolvedValue({
			data: "x",
			metadata: { durationSec: 5 },
		});

		await provider.generate({ prompt: "hi" });

		expect(AssetBundle.upload).toHaveBeenCalledWith(
			"test",
			"mock",
			expect.any(Array),
			{ durationSec: 5 },
		);
	});

	it("propagates _generate errors", async () => {
		provider.generateFn.mockRejectedValue(new Error("provider down"));

		await expect(provider.generate({ prompt: "fail" })).rejects.toThrow(
			"provider down",
		);
		expect(AssetBundle.upload).not.toHaveBeenCalled();
	});

	it("propagates upload errors", async () => {
		provider.generateFn.mockResolvedValue({ data: "ok" });
		vi.mocked(AssetBundle.upload).mockRejectedValueOnce(
			new Error("upload failed"),
		);

		await expect(provider.generate({ prompt: "x" })).rejects.toThrow(
			"upload failed",
		);
	});
});
