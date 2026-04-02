import pick from "lodash/pick";
import { Node } from "slate";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import type { GenerationJob } from "@/lib/generation/queue";
import type { CanvasElement } from "../types";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";

export function buildGenerationJob(
  element: CanvasElement,
  connectorConfig: ConnectorRegistry,
): GenerationJob | null {
  const elementConfig = ELEMENT_CONFIGS[element.type];
  const connectorType = elementConfig.connector;
  const attrs = element.customAttributes ?? {};
  const provider = (attrs.provider as ProviderKey) ?? "openslop";
  const { config: baseConfig } = getDefaultConnector(
    connectorConfig,
    connectorType,
  );
  const config = {
    ...baseConfig,
    ...(attrs.model && { defaultModel: attrs.model }),
  };

  const prompt = Node.string(element).replaceAll(ZERO_WIDTH_SPACE, "").trim();
  if (!prompt) return null;

  const extraParams = pick(attrs, elementConfig.generateParams ?? []);

  return {
    elementId: element.id,
    connectorType,
    provider,
    config,
    prompt,
    extraParams,
  };
}
