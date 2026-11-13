"use client";

import {
	defaultModelFor,
	hasModel,
	modelSourceFor,
	type ConnectorModels,
	type ModelDefaults,
} from "@/lib/connectors/models";
import { groupModels } from "@/lib/connectors/model-groups";
import type { ConnectorType } from "@/lib/connectors/types";
import { ModelPanelTrigger, ModelSelect } from "./model-select";
import { MODEL_PROVENANCE } from "./provenance";

export type DefaultsTier = keyof ModelDefaults;

export function ModelDefaultControl({
	types,
	tier,
	chain,
	onChange,
	label,
	className,
}: {
	/** Every type this control sets; the first decides what it shows. */
	types: ConnectorType[];
	tier: DefaultsTier;
	chain: ModelDefaults;
	onChange: (models: ConnectorModels) => void;
	label: string;
	className?: string;
}) {
	const [type] = types;
	const model = defaultModelFor(type, chain);
	const pinnedHere = hasModel(type, chain[tier]?.[type]);

	return (
		<ModelSelect
			type={type}
			value={model}
			tooltip={
				pinnedHere
					? undefined
					: MODEL_PROVENANCE[modelSourceFor(type, model, chain)]
			}
			onChange={(picked) => onChange(groupModels(types, picked))}
		>
			<ModelPanelTrigger
				model={model}
				label={`${label} model`}
				inherited={!pinnedHere}
				className={className}
			/>
		</ModelSelect>
	);
}
