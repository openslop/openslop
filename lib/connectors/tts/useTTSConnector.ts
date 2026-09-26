"use client";

import { useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createConnector } from "../factory";
import type { ModelRef, TTSConnector } from "../types";

export function useTTSConnector(model: ModelRef): TTSConnector {
	const { connectorConfig } = useConfig();
	const { provider, model: name } = model;
	return useMemo(
		() =>
			createConnector("tts", { provider, model: name }, connectorConfig.tts),
		[connectorConfig, provider, name],
	);
}
