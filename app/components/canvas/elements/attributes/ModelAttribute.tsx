"use client";

import { useSlateStatic } from "slate-react";
import {
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/connectors/ModelSelect";
import { MODEL_PROVENANCE } from "@/app/components/connectors/provenance";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { modelSourceFor } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/useDefaultModels";
import type { ConnectorType } from "@/lib/connectors/types";

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

	return (
		<ModelSelect
			type={connector}
			value={value}
			onChange={(next) =>
				updateElementAttrs(editor, element, { [attrKey]: next })
			}
		>
			<ModelSelectTrigger
				connector={connector}
				model={value}
				label={label}
				title={`${label} · ${MODEL_PROVENANCE[modelSourceFor(connector, value, chain)]}`}
				className={className}
			/>
		</ModelSelect>
	);
}
