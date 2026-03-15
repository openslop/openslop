import { GripVertical } from "lucide-react";
import { ElementConfig, colorClasses } from "../config/elementConfigs";

interface PanelItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: ElementConfig;
  ref?: React.Ref<HTMLDivElement>;
}

export function PanelItem({ item, ref, ...props }: PanelItemProps) {
  const { background, outline, hoverBackground, hoverOutline } =
    colorClasses[item.panelColor];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-move
        transition-[transform,background-color,outline-color] duration-200
        ${background} ${outline} ${hoverBackground} ${hoverOutline}`}
      ref={ref}
      {...props}
    >
      <GripVertical
        size={14}
        className="text-muted-foreground/60 flex-shrink-0"
        aria-hidden="true"
      />
      <span className="text-muted-foreground">{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
    </div>
  );
}
