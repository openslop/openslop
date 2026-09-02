"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { ModelRef } from "@/lib/connectors/types";
import { useDefaultModels } from "@/lib/connectors/useDefaultModels";

type SloppyModelChoice = {
	model: ModelRef;
	setModel: (model: ModelRef) => void;
};

const [SloppyModelContext, useSloppyModel] =
	createRequiredContext<SloppyModelChoice>("SloppyModelProvider");

export { useSloppyModel };

/**
 * Which LLM the next turn runs on. Its own boundary because the choice outlives
 * any turn, so a model picker does not have to subscribe to the agent's
 * streaming status to render. Until the user picks one it follows the project's
 * and account's defaults.
 */
export function SloppyModelProvider({ children }: { children: ReactNode }) {
	const defaults = useDefaultModels();
	const [picked, setPicked] = useState<ModelRef>();
	const model = picked ?? defaults.llm;

	const choice = useMemo(() => ({ model, setModel: setPicked }), [model]);

	return <SloppyModelContext value={choice}>{children}</SloppyModelContext>;
}
