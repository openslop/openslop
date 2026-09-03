"use client";

import { useSlateStatic } from "slate-react";
import {
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/ModelSelect";
import { MODEL_PROVENANCE } from "@/app/components/models/provenance";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ModelPick } from "@/lib/connectors/attributes/schema";
import { modelSourceFor, resolveModel } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/useDefaultModels";
import { flatAttributes } from "@/lib/video/elementAttributes";

export function ModelAttribute({
	element,
	pick: { key, providerAttr, type },
	label,
	className,
}: {
	element: CanvasContentElement;
	pick: ModelPick;
	label: string;
	className?: string;
}) {
	const editor = useSlateStatic();
	const chain = useModelChain();
	const attrs = flatAttributes(element);
	const value = resolveModel(type, {
		provider: attrs[providerAttr],
		model: attrs[key],
	});

	return (
		<ModelSelect
			type={type}
			value={value}
			tooltip={`${label} · ${MODEL_PROVENANCE[modelSourceFor(type, value, chain)]}`}
			onChange={(next) =>
				updateElementAttrs(editor, element, {
					[providerAttr]: next.provider,
					[key]: next.model,
				})
			}
		>
			<ModelSelectTrigger model={value} label={label} className={className} />
		</ModelSelect>
	);
}
