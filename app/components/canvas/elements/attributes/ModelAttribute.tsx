"use client";

import { useSlateStatic } from "slate-react";
import {
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/ModelSelect";
import { MODEL_PROVENANCE } from "@/app/components/models/provenance";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { modelSourceFor, resolveModel } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/useDefaultModels";
import type { ConnectorType } from "@/lib/connectors/types";

export function ModelAttribute({
	element,
	attrKey,
	providerAttr,
	pick,
	connector,
	label,
	className,
}: {
	element: CanvasContentElement;
	attrKey: string;
	providerAttr: string;
	/** The stored pair, resolved here so a pick the tables dropped shows the fallback. */
	pick: { provider?: string; model?: string };
	connector: ConnectorType;
	label: string;
	className?: string;
}) {
	const editor = useSlateStatic();
	const chain = useModelChain();
	const value = resolveModel(connector, pick);

	return (
		<ModelSelect
			type={connector}
			value={value}
			tooltip={`${label} · ${MODEL_PROVENANCE[modelSourceFor(connector, value, chain)]}`}
			onChange={(next) =>
				updateElementAttrs(editor, element, {
					[providerAttr]: next.provider,
					[attrKey]: next.model,
				})
			}
		>
			<ModelSelectTrigger model={value} label={label} className={className} />
		</ModelSelect>
	);
}
