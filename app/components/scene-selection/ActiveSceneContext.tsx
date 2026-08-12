"use client";

import { useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

/** The playing scene's look, shared by every surface that shows scenes. */
export const ACTIVE_SCENE_CLASS = "scene-active bg-element-card";

const [ValueContext, useActiveSceneId] = createRequiredContext<string | null>(
	"ActiveSceneValueContext",
);
const [SetterContext, useSetActiveSceneId] = createRequiredContext<
	(id: string | null) => void
>("ActiveSceneSetterContext");
export { useActiveSceneId, useSetActiveSceneId };

export function ActiveSceneProvider({ children }: { children: ReactNode }) {
	const [id, setId] = useState<string | null>(null);
	return (
		<SetterContext value={setId}>
			<ValueContext value={id}>{children}</ValueContext>
		</SetterContext>
	);
}
