"use client";

import { useSlateStatic } from "slate-react";
import {
	ConfigureModelsItem,
	ModelPanelTrigger,
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/model-select";
import { MODEL_PROVENANCE } from "@/app/components/models/provenance";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { connectorOf, type GeneratedElement } from "@/lib/canvas/types";
import { modelSourceFor, resolveModel } from "@/lib/connectors/models";
import { useModelChain } from "@/lib/connectors/use-default-models";
import { flatAttributes } from "@/lib/canvas/element-attributes";

export function ModelAttribute({
	element,
	label,
	look = "inline",
	className,
}: {
	element: GeneratedElement;
	label: string;
	/** `panel` matches the side panel's other dropdowns. */
	look?: "inline" | "panel";
	className?: string;
}) {
	const editor = useSlateStatic();
	const chain = useModelChain();
	const type = connectorOf(element.type);
	const value = resolveModel(type, flatAttributes(element));

	return (
		<ModelSelect
			type={type}
			value={value}
			tooltip={`${label} · ${MODEL_PROVENANCE[modelSourceFor(type, value, chain)]}`}
			footer={<ConfigureModelsItem />}
			onChange={(next) => mergeAttrs(editor, element.id, next)}
		>
			{look === "panel" ? (
				<ModelPanelTrigger model={value} label={label} className={className} />
			) : (
				<ModelSelectTrigger model={value} label={label} className={className} />
			)}
		</ModelSelect>
	);
}
