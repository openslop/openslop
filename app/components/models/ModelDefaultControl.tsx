"use client";

import { SelectMenuTrigger } from "@/components/ui/select-menu";
import {
	defaultModelFor,
	modelSourceFor,
	type ConnectorModels,
	type ModelDefaults,
} from "@/lib/connectors/models";
import type { ConnectorType } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";
import { ModelSelect } from "./ModelSelect";
import { ProviderIcon } from "./ProviderIcon";
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
	const pinnedHere = Boolean(chain[tier]?.[type]);

	return (
		<ModelSelect
			type={type}
			value={model}
			tooltip={
				pinnedHere
					? undefined
					: MODEL_PROVENANCE[modelSourceFor(type, model, chain)]
			}
			onChange={(picked) =>
				onChange(Object.fromEntries(types.map((each) => [each, picked])))
			}
		>
			<SelectMenuTrigger
				aria-label={`${label} model`}
				className={cn("min-w-0", className)}
			>
				<ProviderIcon
					provider={model.provider}
					size={14}
					className={cn(!pinnedHere && "opacity-70")}
				/>
				<span
					className={cn(
						"min-w-0 truncate",
						!pinnedHere && "text-muted-foreground",
					)}
				>
					{model.model}
				</span>
			</SelectMenuTrigger>
		</ModelSelect>
	);
}
