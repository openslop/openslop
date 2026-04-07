import get from "lodash/get";
import type { BaseProvider } from "@/lib/providers/base";
import type { BundleFile, BundleResponse } from "./asset-bundle";
import { AssetBundle } from "./asset-bundle";

type BlobConfig = {
  type: string;
  provider: string;
};

export function withBlobStorage<
  TParams,
  TResult,
  T extends BaseProvider<TParams, TResult>,
>(
  provider: T,
  config: BlobConfig,
  toFiles: (result: TResult) => BundleFile[] | Promise<BundleFile[]>,
): Omit<T, "generate"> & BaseProvider<TParams, BundleResponse> {
  return Object.assign(Object.create(provider), {
    generate: async (params: TParams) => {
      const result = await provider.generate(params);
      const files = await toFiles(result);
      return AssetBundle.upload(
        config.type,
        config.provider,
        files,
        get(result, "metadata"),
      );
    },
  });
}
