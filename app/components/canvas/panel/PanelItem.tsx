import { forwardRef } from "react";
import { GripVertical } from "lucide-react";
import { ElementConfig, colorClasses } from "../config/elementConfigs";

interface PanelItemProps {
  item: ElementConfig;
  isHovered: boolean;
}

export const PanelItem = forwardRef<HTMLDivElement, PanelItemProps>(
  ({ item, isHovered, ...props }: PanelItemProps, ref) => {
    const { background, outline, hoverBackground, hoverOutline } =
      colorClasses[item.panelColor];

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-move
          transition-all duration-200
          ${background} ${outline} ${hoverBackground} ${hoverOutline}
          ${isHovered ? "scale-105" : ""}`}
        ref={ref}
        {...props}
      >
        <GripVertical
          size={14}
          className="text-muted-foreground/60 flex-shrink-0"
        />
        <span className="text-muted-foreground">{item.icon}</span>
        <span className="text-sm font-medium">{item.label}</span>
      </div>
    );
  },
);

PanelItem.displayName = "PanelItem";
