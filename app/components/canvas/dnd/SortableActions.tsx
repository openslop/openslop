import { GripVertical, Plus } from "@/components/ui/icon";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ActionMenu } from "@/components/ui/action-menu";

export interface InsertOption<K extends string = string> {
	key: K;
	label: string;
	icon: React.ReactNode;
	iconBgClass: string;
	colorClass: string;
}

interface SortableActionsProps<K extends string> {
	options?: InsertOption<K>[];
	onInsert?: (key: K) => void;
	listeners?: SyntheticListenerMap;
	onMenuOpenChange?: (open: boolean) => void;
}

export function SortableActions<K extends string>({
	options,
	onInsert,
	listeners,
	onMenuOpenChange,
}: SortableActionsProps<K>) {
	return (
		<>
			{onInsert && options && options.length > 0 && (
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
					onOpenChange={onMenuOpenChange}
				>
					<button
						aria-label="Insert item"
						className="inline-flex items-center rounded-md p-0.5 text-muted-foreground
              hover:text-foreground hover:bg-muted transition-[color,background-color] duration-200"
					>
						<Plus size={18} />
					</button>
				</ActionMenu>
			)}
			<button
				aria-label="Drag to reorder"
				className="inline-flex items-center rounded-md p-0.5 text-muted-foreground
        hover:text-foreground hover:bg-muted transition-[color,background-color] duration-200
        cursor-grab active:cursor-grabbing"
				{...listeners}
			>
				<GripVertical size={22} />
			</button>
		</>
	);
}
