import { useMemo } from "react";
import { Codesandbox } from "@/components/ui/icon";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { reconcileAttributes } from "@/lib/connectors/attributes/reconcile";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import { AttributeBadge } from "./AttributeBadge";

export function ModelBadge({ element }: { element: CanvasContentElement }) {
	const { connectorConfig } = useConfig();
	const { model, provider } = element.customAttributes ?? {};
	const connector = ELEMENT_CONFIGS[element.type].connector;

	const spec = useMemo<AttributeSpec | null>(() => {
		if (!model || !provider) return null;
		const options =
			connectorConfig[connector]?.[provider as ProviderKey]?.models ?? [];
		return {
			label: "Model",
			icon: Codesandbox,
			edit: { kind: "enum", options },
		};
	}, [connector, connectorConfig, model, provider]);

	if (!spec) return null;

	const reconcileForModel = (next: string) => {
		const oldSchema = resolveAttributeSchema(
			connector,
			provider as ProviderKey,
			model,
		);
		const newSchema = resolveAttributeSchema(
			connector,
			provider as ProviderKey,
			next,
		);
		return reconcileAttributes(
			oldSchema,
			newSchema,
			element.customAttributes ?? {},
		);
	};

	return (
		<AttributeBadge
			element={element}
			attrKey="model"
			spec={spec}
			onSelect={reconcileForModel}
		/>
	);
}
