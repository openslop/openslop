import { GripVertical, Plus } from "@/components/ui/icon";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ActionMenu } from "@/components/ui/action-menu";
import { IconButton } from "@/components/ui/icon-button";

export interface InsertOption<K extends string = string> {
	key: K;
	label: string;
	icon: React.ReactNode;
	iconBgClass: string;
	colorClass: string;
}

export function InsertMenu<K extends string>({
	options,
	onInsert,
	onOpenChange,
}: {
	options: InsertOption<K>[];
	onInsert: (key: K) => void;
	onOpenChange?: (open: boolean) => void;
}) {
	if (options.length === 0) return null;
	return (
		<ActionMenu
			items={options.map((option) => ({
				key: option.key,
				label: option.label,
				icon: (
					<span
						className={`${option.iconBgClass} ${option.colorClass} mr-1 inline-flex size-6 items-center justify-center rounded-md`}
					>
						{option.icon}
					</span>
				),
				onSelect: () => onInsert(option.key),
			}))}
			contentClassName="w-40"
			itemClassName="rounded-lg py-1"
			onOpenChange={onOpenChange}
		>
			<IconButton ariaLabel="Insert item" variant="quiet">
				<Plus size={18} />
			</IconButton>
		</ActionMenu>
	);
}

export function DragHandle({
	listeners,
}: {
	listeners?: SyntheticListenerMap;
}) {
	return (
		<IconButton
			ariaLabel="Drag to reorder"
			variant="quiet"
			className="cursor-grab active:cursor-grabbing"
			{...listeners}
		>
			<GripVertical size={22} />
		</IconButton>
	);
}
