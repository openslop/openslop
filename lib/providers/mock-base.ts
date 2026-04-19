import type { BundleResponse } from "@/lib/api/asset-bundle";
import { BaseProvider } from "./base";
import { pickRandom } from "./mock-utils";

export abstract class MockProvider<TParams> extends BaseProvider<
  TParams,
  BundleResponse,
  BundleResponse
> {
  protected abstract readonly variants: BundleResponse[];
  protected readonly delayMs: number = 0;
  protected readonly blobConfig = { type: "mock", provider: "mock" };

  protected toFiles() {
    return [];
  }

  protected async store(result: BundleResponse) {
    return result;
  }

  protected async _generate(): Promise<BundleResponse> {
    if (this.delayMs > 0) {
      await new Promise((r) =>
        setTimeout(r, this.delayMs + Math.random() * this.delayMs),
      );
    }
    return pickRandom(this.variants);
  }
}
