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

/**
 * The model one connector type falls back to, for whichever scope is editing
 * it. A value this scope has not pinned reads muted and says where it came
 * from, so a row can be understood without opening it.
 */
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
	/** The whole chain, so the control can resolve and explain what it shows. */
	chain: ModelDefaults;
	/** The pick, spread across every type this control covers. */
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
			onChange={(picked) =>
				onChange(Object.fromEntries(types.map((each) => [each, picked])))
			}
		>
			<SelectMenuTrigger
				aria-label={`${label} model`}
				title={
					pinnedHere
						? undefined
						: MODEL_PROVENANCE[modelSourceFor(type, model, chain)]
				}
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
