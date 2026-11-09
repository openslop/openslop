import { GripVertical, Plus } from "@/components/ui/icon";
import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { ActionMenu } from "@/components/ui/action-menu";
import { IconButton } from "@/components/ui/icon-button";

export interface InsertOption<K extends string = string> {
	key: K;
	label: string;
	icon: React.ReactNode;
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
			items={options.map(({ key, label, icon }) => ({
				key,
				label,
				icon,
				onSelect: () => onInsert(key),
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
	attributes,
	listeners,
	ref,
}: {
	attributes?: DraggableAttributes;
	listeners?: DraggableSyntheticListeners;
	ref?: React.Ref<HTMLButtonElement>;
}) {
	return (
		<IconButton
			ref={ref}
			ariaLabel="Drag to reorder"
			variant="quiet"
			className="cursor-grab active:cursor-grabbing"
			{...attributes}
			{...listeners}
		>
			<GripVertical size={22} />
		</IconButton>
	);
}
