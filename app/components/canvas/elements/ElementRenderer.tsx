import { JSX } from "react";
import { RenderElementProps } from "slate-react";
import type { CanvasElementType } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { ElementContainer } from "./ElementContainer";

export const renderStoryElement = (props: RenderElementProps): JSX.Element => {
  const config = ELEMENT_CONFIGS[props.element.type as CanvasElementType];

  return (
    <ElementContainer
      icon={config.icon}
      label={config.label}
      bgColor={config.bgColor}
      placeholder={config.placeholder}
      customAttributes={props.element.customAttributes}
      {...props}
    />
  );
};
