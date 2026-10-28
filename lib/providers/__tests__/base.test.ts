import { describe, expect, it, vi, beforeEach } from "vitest";

import { BaseProvider, chargedUsd, type WithMetadata } from "../base";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { spyAssetBundle } from "./_asset-bundle";

type TestParams = { prompt: string; size?: number };
type TestRawResult = { data: string; costUsd: number } & WithMetadata;

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
	const { upload } = spyAssetBundle();
	let provider: TestProvider;

	beforeEach(() => {
		provider = new TestProvider();
	});

	it("calls _generate then store (upload)", async () => {
		provider.generateFn.mockResolvedValue({ data: "abc", costUsd: 0.01 });

		const result = await provider.generate({ prompt: "hello" });

		expect(provider.generateFn).toHaveBeenCalledWith({ prompt: "hello" });
		expect(upload).toHaveBeenCalledWith(
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
		expect(result.output).toEqual(
			expect.objectContaining({
				provider: "mock",
				result: { output: "out.bin" },
			}),
		);
		expect(result.costUsd).toBe(0.01);
	});

	it("forwards metadata to upload", async () => {
		provider.generateFn.mockResolvedValue({
			data: "x",
			costUsd: 0.01,
			metadata: { durationSec: 5 },
		});

		await provider.generate({ prompt: "hi" });

		expect(upload).toHaveBeenCalledWith("test", "mock", expect.any(Array), {
			durationSec: 5,
		});
	});

	it("propagates _generate errors", async () => {
		provider.generateFn.mockRejectedValue(new Error("provider down"));

		await expect(provider.generate({ prompt: "fail" })).rejects.toThrow(
			"provider down",
		);
		expect(upload).not.toHaveBeenCalled();
	});

	it("carries the vendor's charge on an upload error, with its reason", async () => {
		provider.generateFn.mockResolvedValue({ data: "ok", costUsd: 0.01 });
		const failure = new Error("upload failed");
		upload.mockRejectedValueOnce(failure);

		const error = await provider.generate({ prompt: "x" }).catch((e) => e);

		expect(chargedUsd(error)).toBe(0.01);
		expect(error).toMatchObject({ message: "upload failed", cause: failure });
	});
});
