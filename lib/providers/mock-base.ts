import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { ValidationResult } from "@/lib/connectors/providerKey";
import { mockDelay, pickRandom } from "./mock-utils";

type MockVariant = Omit<BundleResponse, "provider" | "type">;

// Mocks serve canned bundles and never upload anything, so they deliberately do
// not extend BaseProvider — there is no toFiles/store half to inherit.
export abstract class MockProvider<TParams> {
	protected abstract readonly variants: MockVariant[];
	protected readonly delayMs: number = 0;

	async validate(): Promise<ValidationResult> {
		return { ok: true };
	}

	async generate(_params: TParams): Promise<BundleResponse> {
		await mockDelay(this.delayMs);
		return { ...pickRandom(this.variants), type: "mock", provider: "mock" };
	}
}
