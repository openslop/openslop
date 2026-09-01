"use client";

import { useSlateStatic } from "slate-react";
import { ChevronDown } from "@/components/ui/icon";
import { ModelSelect } from "@/app/components/connectors/ModelSelect";
import { MODEL_PROVENANCE } from "@/app/components/connectors/provenance";
import { ProviderIcon } from "@/app/components/connectors/ProviderIcon";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { modelSourceFor, providerForModel } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/useDefaultModels";
import type { ConnectorType } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";

/**
 * The model badge on an element. It shows the provider it will run on, and says
 * where the choice came from: an element keeps its own model only once it
 * differs from what its project and account resolve to.
 */
export function ModelAttribute({
	element,
	attrKey,
	connector,
	label,
	value,
	className,
}: {
	element: CanvasContentElement;
	attrKey: string;
	connector: ConnectorType;
	/** What this model is for, since an element can pick more than one. */
	label: string;
	value: string;
	className?: string;
}) {
	const editor = useSlateStatic();
	const chain = useModelChain();
	const source = modelSourceFor(connector, value, chain);

	return (
		<ModelSelect
			type={connector}
			value={value}
			onChange={(next) =>
				updateElementAttrs(editor, element, { [attrKey]: next })
			}
		>
			<button
				type="button"
				aria-label={`${label}: ${value}`}
				title={`${label} · ${MODEL_PROVENANCE[source]}`}
				onMouseDown={(event) => event.preventDefault()}
				className={cn(
					"inline-flex max-w-[180px] cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground focus-ring",
					className,
				)}
			>
				<ProviderIcon provider={providerForModel(connector, value)} size={12} />
				<span className="min-w-0 truncate">{value}</span>
				<ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
			</button>
		</ModelSelect>
	);
}
