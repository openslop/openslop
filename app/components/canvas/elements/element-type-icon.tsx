import { ICON_SIZES } from "@/components/ui/icon-button";
import type { ContentType } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { ELEMENT_CONFIGS } from "./element-configs";

/** A content type's icon on its media tint. */
export function ElementTypeIcon({ type }: { type: ContentType }) {
	const { Icon, iconBgClass, colorClass } = ELEMENT_CONFIGS[type];
	return (
		<span
			className={cn(
				"inline-flex size-6 shrink-0 items-center justify-center rounded-md",
				iconBgClass,
				colorClass,
			)}
		>
			<Icon size={ICON_SIZES.default} />
		</span>
	);
}
