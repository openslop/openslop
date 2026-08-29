"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { LLM_MODELS } from "@/lib/connectors/llm/models";

type SloppyModelChoice = {
	model: string;
	setModel: (model: string) => void;
	models: string[];
};

const [SloppyModelContext, useSloppyModel] =
	createRequiredContext<SloppyModelChoice>("SloppyModelProvider");

export { useSloppyModel };

/**
 * Which LLM the next turn runs on. Its own boundary because the choice outlives
 * any turn, so a model picker does not have to subscribe to the agent's
 * streaming status to render.
 */
export function SloppyModelProvider({ children }: { children: ReactNode }) {
	const [model, setModel] = useState(LLM_MODELS.defaultModel);

	const choice = useMemo(
		() => ({ model, setModel, models: LLM_MODELS.names }),
		[model],
	);

	return <SloppyModelContext value={choice}>{children}</SloppyModelContext>;
}
