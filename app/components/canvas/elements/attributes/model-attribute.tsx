"use client";

import { useSlateStatic } from "slate-react";
import {
	ConfigureModelsItem,
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/model-select";
import { MODEL_PROVENANCE } from "@/app/components/models/provenance";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { CanvasElement } from "@/lib/canvas/types";
import type { ModelPick } from "@/lib/connectors/attributes/schema";
import { modelSourceFor, resolveModel } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/use-default-models";
import { flatAttributes } from "@/lib/canvas/element-attributes";

export function ModelAttribute({
	element,
	pick: { key, providerAttr, type },
	label,
	className,
}: {
	element: CanvasElement;
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
			footer={<ConfigureModelsItem />}
			onChange={(next) =>
				mergeAttrs(editor, element.id, {
					[providerAttr]: next.provider,
					[key]: next.model,
				})
			}
		>
			<ModelSelectTrigger model={value} label={label} className={className} />
		</ModelSelect>
	);
}
