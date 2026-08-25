"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/connectors/registry";

type SloppyModelChoice = {
	model: string;
	setModel: (model: string) => void;
	models: string[];
};

const [SloppyModelContext, useSloppyModel] =
	createRequiredContext<SloppyModelChoice>("SloppyModelProvider");

export { useSloppyModel };

/**
 * Which LLM the next turn runs on. Its own boundary because the choice comes
 * from the connector config and outlives any turn, so a model picker does not
 * have to subscribe to the agent's streaming status to render.
 */
export function SloppyModelProvider({ children }: { children: ReactNode }) {
	const { connectorConfig } = useConfig();
	const { config } = getDefaultConnector(connectorConfig, "llm");
	const [model, setModel] = useState(config.defaultModel);

	const choice = useMemo(
		() => ({ model, setModel, models: config.models }),
		[model, config.models],
	);

	return <SloppyModelContext value={choice}>{children}</SloppyModelContext>;
}
