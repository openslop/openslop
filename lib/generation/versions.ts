import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import type { CanvasElementType } from "@/lib/canvas/types";
import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { serializeInputs, type GenerationInputs } from "./inputs";

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

	/** A replacement keeps the original date: the same version, remade. */
	record(committed: CommittedVersion, createdAt: string): ElementVersion {
		const key = versionKey(committed);
		const byKey = keyBy(this.get(committed.elementId), versionKey);
		const version: ElementVersion = {
			...committed,
			createdAt: byKey[key]?.createdAt ?? createdAt,
		};
		this.byElement.set(
			committed.elementId,
			Object.values({ ...byKey, [key]: version }),
		);
		return version;
	}
}
