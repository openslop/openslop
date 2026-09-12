import { Plus } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";

export function SceneInsertHandle({ onInsert }: { onInsert: () => void }) {
	return (
		<SimpleTooltip label="Add scene">
			<button
				type="button"
				aria-label="Add scene"
				onClick={onInsert}
				className="group/insert relative z-10 -mx-2 flex h-16 w-6 shrink-0 items-center justify-center rounded-xs focus-ring"
			>
				<span className="relative flex h-8 w-2 items-center justify-center rounded-xs bg-generate text-generate-foreground transition-[width,background-color,border-radius] duration-200 ease-out group-hover/insert:w-8 group-hover/insert:rounded-md group-hover/insert:bg-generate-hover group-focus-visible/insert:w-8 group-focus-visible/insert:rounded-md group-focus-visible/insert:bg-generate-hover motion-reduce:transition-none">
					<span className="absolute h-3 w-px bg-generate-foreground/60 transition-opacity duration-200 group-hover/insert:opacity-0 group-focus-visible/insert:opacity-0 motion-reduce:transition-none" />
					<Plus
						size={16}
						className="opacity-0 transition-opacity duration-200 group-hover/insert:opacity-100 group-focus-visible/insert:opacity-100 motion-reduce:transition-none"
					/>
				</span>
			</button>
		</SimpleTooltip>
	);
}
