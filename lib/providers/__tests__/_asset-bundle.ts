import { beforeEach, vi } from "vitest";
import { AssetBundle } from "@/lib/api/asset-bundle";

/** An empty store at https://assets.test that echoes every upload back. */
export function spyAssetBundle() {
	const load = vi.fn<typeof AssetBundle.load>();
	const upload = vi.fn<typeof AssetBundle.upload>();
	beforeEach(() => {
		AssetBundle.baseUrl = "https://assets.test";
		load.mockResolvedValue(null);
		upload.mockImplementation(
			async (type, provider, files, metadata, options) => ({
				id: options?.id ?? "drawn",
				type,
				provider,
				result: Object.fromEntries(files.map((f) => [f.key, f.filename])),
				metadata,
			}),
		);
		vi.spyOn(AssetBundle, "load").mockImplementation(load);
		vi.spyOn(AssetBundle, "upload").mockImplementation(upload);
	});
	return { load, upload };
}
