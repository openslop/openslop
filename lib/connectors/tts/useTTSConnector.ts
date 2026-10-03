"use client";

import { useMemo } from "react";
import { createConnector } from "../factory";
import type { ModelRef, TTSConnector } from "../types";

export function useTTSConnector(model: ModelRef): TTSConnector {
	const { provider, model: name } = model;
	return useMemo(
		() => createConnector("tts", { provider, model: name }),
		[provider, name],
	);
}
