import isEqual from "lodash/isEqual";

export type GenerationInputs = {
  prompt: string;
  attributes: Record<string, string>;
};

function inputsEqual(a: GenerationInputs, b: GenerationInputs): boolean {
  return a.prompt === b.prompt && isEqual(a.attributes, b.attributes);
}

export function isStaleResult(
  snapshot: { result: unknown; resultInputs: GenerationInputs | null },
  currentInputs: GenerationInputs,
): boolean {
  return (
    snapshot.result !== null &&
    snapshot.resultInputs !== null &&
    !inputsEqual(snapshot.resultInputs, currentInputs)
  );
}

export function serializeInputs(inputs: GenerationInputs): string {
  return JSON.stringify(inputs);
}
