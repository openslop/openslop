import type { IconComponent } from "@/components/ui/icon";
import { ICON_SIZES } from "@/components/ui/icon-button";

/** Says a surface has nothing to show yet, and what would put something there. */
export function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: IconComponent;
	title: string;
	description: string;
}) {
	return (
		<div
			role="status"
			className="flex flex-col items-center gap-1 py-4 text-center"
		>
			<span className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Icon size={ICON_SIZES.default} />
			</span>
			<p className="text-label font-medium text-foreground">{title}</p>
			<p className="text-label text-muted-foreground">{description}</p>
		</div>
	);
}
