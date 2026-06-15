import { GripVertical, Plus } from "@/components/ui/icon";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface InsertOption<K extends string = string> {
	key: K;
	label: string;
	icon: React.ReactNode;
	iconBgClass: string;
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
			{options?.length && onInsert && (
				<DropdownMenu modal={false} onOpenChange={onMenuOpenChange}>
					<DropdownMenuTrigger asChild>
						<button
							aria-label="Insert item"
							className="inline-flex items-center rounded-md p-0.5 text-muted-foreground
              hover:text-foreground hover:bg-muted transition-[color,background-color] duration-200"
						>
							<Plus size={24} />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side="bottom"
						align="start"
						className="w-40 rounded-xl border border-border bg-card shadow-md shadow-black/8 p-1"
					>
						{options.map((option) => (
							<DropdownMenuItem
								key={option.key}
								onClick={() => onInsert(option.key)}
								className="cursor-pointer rounded-lg py-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:text-foreground focus:bg-muted"
							>
								<span
									className={`${option.iconBgClass} mr-1 inline-flex size-7 items-center justify-center rounded-lg`}
								>
									{option.icon}
								</span>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
			<button
				aria-label="Drag to reorder"
				className="inline-flex items-center rounded-md p-0.5 text-muted-foreground
        hover:text-foreground hover:bg-muted transition-[color,background-color] duration-200
        cursor-grab active:cursor-grabbing"
				{...listeners}
			>
				<GripVertical size={24} />
			</button>
		</>
	);
}
