import { useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_CONFIGS, type AttributeSpec } from "../config/elementConfigs";
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
			color: "bg-white/15",
			label: "Model",
			edit: { kind: "enum", options },
		};
	}, [connector, connectorConfig, model, provider]);

	if (!spec) return null;
	return <AttributeBadge element={element} attrKey="model" spec={spec} />;
}
