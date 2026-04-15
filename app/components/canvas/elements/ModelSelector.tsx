import { useMemo } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import { Transforms } from "slate";
import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { ProviderKey } from "@/lib/connectors/types";
import GlassDropdown, {
  type GlassDropdownOption,
} from "@/app/components/GlassDropdown";

export function ModelSelector({
  element,
  model,
  provider,
}: {
  element: CanvasContentElement;
  model: string;
  provider: ProviderKey;
}) {
  const editor = useSlateStatic();
  const { connectorConfig } = useConfig();

  const connectorType = ELEMENT_CONFIGS[element.type].connector;

  const options = useMemo<GlassDropdownOption<string>[]>(() => {
    const models = connectorConfig[connectorType]?.[provider]?.models ?? [];
    return models.map((m) => ({ value: m, label: m }));
  }, [connectorConfig, connectorType, provider]);

  const handleSelect = (newModel: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(
      editor,
      { customAttributes: { ...element.customAttributes, model: newModel } },
      { at: path },
    );
  };

  return (
    <GlassDropdown
      value={model}
      onChange={handleSelect}
      options={options}
      ariaLabel={`Select model, current: ${model}`}
      className="truncate max-w-[120px]"
    />
  );
}
