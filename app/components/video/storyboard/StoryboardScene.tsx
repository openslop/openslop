import type { KeyboardEvent } from "react";
import {
	ACTIVE_SCENE_CLASS,
	useActiveSceneId,
} from "@/app/components/scene-selection/ActiveSceneContext";
import { ForegroundPreview } from "@/app/components/canvas/elements/ForegroundPreview";
import { cn } from "@/lib/utils";
import type { StoryboardScene as StoryboardSceneData } from "./storyboardScenes";

export function StoryboardScene({
	item,
	aspectRatio,
	onSelect,
	onDelete,
}: {
	item: StoryboardSceneData;
	aspectRatio: string;
	onSelect: () => void;
	onDelete: () => void;
}) {
	const isActive = useActiveSceneId() === item.scene.id;

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key !== "Delete" && event.key !== "Backspace") return;
		event.preventDefault();
		onDelete();
	};

	return (
		<div className="flex shrink-0 flex-col items-center gap-1.5">
			<button
				type="button"
				aria-label={`Scene ${item.sceneIndex}`}
				aria-current={isActive ? "true" : undefined}
				onClick={onSelect}
				onKeyDown={handleKeyDown}
				className={cn(
					"rounded-lg p-1 transition-colors focus-ring",
					isActive ? ACTIVE_SCENE_CLASS : "hover:bg-surface-hover",
				)}
			>
				<div className="h-14" style={{ aspectRatio }}>
					{item.foreground ? (
						<ForegroundPreview element={item.foreground} />
					) : (
						<div className="h-full w-full rounded-lg border bg-muted" />
					)}
				</div>
			</button>
			<span className="text-badge-xs text-muted-foreground">
				{item.sceneIndex}
			</span>
		</div>
	);
}
