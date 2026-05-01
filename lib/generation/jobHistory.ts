/**
 * Per-element result cache used by `GenerationQueue`.
 *
 * Keys results by a serialized snapshot of the inputs that produced them so
 * that re-running an element with identical inputs is an instant cache hit.
 * The store is intentionally narrow: callers only `record` after a successful
 * generation and `lookup` when restoring a cached result.
 */
import type { AssetResult } from "../connectors/types";
import { serializeInputs, type GenerationInputs } from "./generationInputs";

export class JobHistory {
	private byElement = new Map<string, Map<string, AssetResult>>();

	record(elementId: string, inputs: GenerationInputs, result: AssetResult) {
		const key = serializeInputs(inputs);
		const existing =
			this.byElement.get(elementId) ?? new Map<string, AssetResult>();
		existing.set(key, result);
		this.byElement.set(elementId, existing);
	}

	lookup(elementId: string, inputs: GenerationInputs): AssetResult | undefined {
		return this.byElement.get(elementId)?.get(serializeInputs(inputs));
	}
}
