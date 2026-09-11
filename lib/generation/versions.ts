import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import type { CanvasElementType } from "@/lib/canvas/types";
import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { serializeInputs, type GenerationInputs } from "./inputs";
import type { ElementSnapshot } from "./snapshots";

export type ElementVersion = {
	elementId: string;
	createdAt: string;
	connectorType: AssetConnectorType;
	/** Absent on versions stored before the element type was recorded. */
	elementType?: CanvasElementType;
	inputs: GenerationInputs;
	result: AssetResult;
	/** The result was supplied rather than generated. */
	pinned: boolean;
};

export type CommittedVersion = Omit<ElementVersion, "createdAt">;

const NO_VERSIONS: readonly ElementVersion[] = [];

export const versionKey = ({
	inputs,
	pinned,
}: Pick<CommittedVersion, "inputs" | "pinned">): string =>
	`${pinned ? "supplied" : "generated"}:${serializeInputs(inputs)}`;

/** A failed regeneration nulls `result` but leaves `resultInputs`, so gate on both. */
export const activeVersionIndex = (
	versions: readonly ElementVersion[],
	{
		result,
		resultInputs,
		pinned,
	}: Pick<ElementSnapshot, "result" | "resultInputs" | "pinned">,
): number => {
	if (!result || !resultInputs) return -1;
	const key = versionKey({ inputs: resultInputs, pinned });
	return versions.findIndex((version) => versionKey(version) === key);
};

export class VersionLog {
	private byElement = new Map<string, ElementVersion[]>();
	private hydrated = new Set<string>();

	isHydrated = (elementId: string): boolean => this.hydrated.has(elementId);

	get = (elementId: string): readonly ElementVersion[] =>
		this.byElement.get(elementId) ?? NO_VERSIONS;

	hydrate(elementId: string, stored: ElementVersion[]) {
		const merged = {
			...keyBy(stored, versionKey),
			...keyBy(this.get(elementId), versionKey),
		};
		this.byElement.set(elementId, sortBy(merged, "createdAt"));
		this.hydrated.add(elementId);
	}

	record(version: ElementVersion) {
		const byKey = keyBy(this.get(version.elementId), versionKey);
		this.byElement.set(
			version.elementId,
			Object.values({ ...byKey, [versionKey(version)]: version }),
		);
	}
}
