import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy";
import type { AssetConnectorType, AssetResult } from "../connectors/types";
import { serializeInputs, type GenerationInputs } from "./inputs";

export type ElementVersion = {
	id: string;
	elementId: string;
	createdAt: string;
	connectorType: AssetConnectorType;
	inputs: GenerationInputs;
	result: AssetResult;
	/** The result was supplied rather than generated. */
	pinned: boolean;
};

export type CommittedTake = Omit<ElementVersion, "id" | "createdAt">;

const NO_VERSIONS: readonly ElementVersion[] = [];

/** A take is identified by the inputs that made it. */
const keyOf = ({ inputs }: Pick<ElementVersion, "inputs">) =>
	serializeInputs(inputs);

export class VersionLog {
	private byElement = new Map<string, ElementVersion[]>();
	private hydrated = new Set<string>();

	isHydrated = (elementId: string): boolean => this.hydrated.has(elementId);

	get = (elementId: string): readonly ElementVersion[] =>
		this.byElement.get(elementId) ?? NO_VERSIONS;

	hydrate(elementId: string, stored: ElementVersion[]) {
		const merged = {
			...keyBy(stored, keyOf),
			...keyBy(this.get(elementId), keyOf),
		};
		this.byElement.set(elementId, sortBy(merged, "createdAt"));
		this.hydrated.add(elementId);
	}

	matching = (
		elementId: string,
		inputs: GenerationInputs,
	): ElementVersion | null => {
		const key = serializeInputs(inputs);
		return (
			this.get(elementId).find((version) => keyOf(version) === key) ?? null
		);
	};

	/** A replacement keeps the original id and date: the same take, remade. */
	record(take: CommittedTake, createdAt: string): ElementVersion {
		const key = keyOf(take);
		const byInputs = keyBy(this.get(take.elementId), keyOf);
		const previous: ElementVersion | undefined = byInputs[key];
		const version: ElementVersion = {
			...take,
			id: previous?.id ?? crypto.randomUUID(),
			createdAt: previous?.createdAt ?? createdAt,
		};
		this.byElement.set(
			take.elementId,
			Object.values({ ...byInputs, [key]: version }),
		);
		return version;
	}
}
