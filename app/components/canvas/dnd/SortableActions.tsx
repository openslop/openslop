import { GripVertical, Plus } from "@/components/ui/icon";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ActionMenu } from "@/components/ui/action-menu";

const ACTION_BUTTON_CLASS =
	"inline-flex items-center rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-[color,background-color] duration-200";

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
			<button aria-label="Insert item" className={ACTION_BUTTON_CLASS}>
				<Plus size={18} />
			</button>
		</ActionMenu>
	);
}

export function DragHandle({
	listeners,
}: {
	listeners?: SyntheticListenerMap;
}) {
	return (
		<button
			aria-label="Drag to reorder"
			className={`${ACTION_BUTTON_CLASS} cursor-grab active:cursor-grabbing`}
			{...listeners}
		>
			<GripVertical size={22} />
		</button>
	);
}
