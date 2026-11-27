import pick from "lodash/pick";
import type { z } from "zod";
import { isByokProvider } from "@/lib/connectors/provider-catalog";
import type { ConnectorType, ModelRef } from "@/lib/connectors/types";
import type { ProviderType, Providers } from "@/lib/providers/types";
import { LocalAgentLLM } from "@/lib/providers/llm/local-agent/provider";
import {
	byokModel,
	hostedModel,
	localModel,
	type BYOKModelRef,
	type LocalModelRef,
} from "./generation-schema";
import { createJob } from "./jobs";
import { byokProviderFor } from "./providers/byok";
import { hostedProviderFor } from "./providers/openslop";
import { localOnly } from "./local-only";
import {
	createHostedRouteHandler,
	createSessionRouteHandler,
} from "./route-handler";

/**
 * Everything that differs between the route families, in one place: who
 * a generation route lets in, how it names its models, whose key a picked
 * model runs on, and whether its streamed LLM spend is booked. A route picks a
 * family and a connector type; nothing else about it varies.
 */
export type RouteFamily<TPicked extends ModelRef> = {
	createHandler: typeof createHostedRouteHandler;
	model: (type: ConnectorType) => z.ZodType<TPicked>;
	providerFor: <K extends ProviderType>(
		userId: string,
		type: K,
		picked: TPicked,
	) => Promise<Providers[K]>;
	recordSpend: (
		userId: string,
		picked: TPicked & { projectId?: string },
		costUsd: number,
	) => Promise<unknown>;
};

export const HOSTED: RouteFamily<ModelRef> = {
	createHandler: createHostedRouteHandler,
	model: hostedModel,
	providerFor: async (_userId, type, picked) =>
		hostedProviderFor(type, picked.model),
	// LLM calls stream instead of queueing, so each is booked as a finished job.
	recordSpend: (userId, picked, costUsd) =>
		createJob({
			userId,
			projectId: picked.projectId,
			connectorType: "llm",
			request: pick(picked, "provider", "model"),
			status: "completed",
			costUsd,
		}),
};

export const BYOK: RouteFamily<BYOKModelRef> = {
	createHandler: createSessionRouteHandler,
	model: byokModel,
	providerFor: (userId, type, picked) =>
		byokProviderFor(userId, picked.provider, type),
	recordSpend: async () => {},
};

const LOCAL_PROVIDERS: Partial<{ [K in ProviderType]: () => Providers[K] }> = {
	llm: () => new LocalAgentLLM(),
};

/** The agents installed on the user's own computer, reached only from it. */
export const LOCAL: RouteFamily<LocalModelRef> = {
	createHandler: (options) => localOnly(createSessionRouteHandler(options)),
	model: localModel,
	providerFor: async (_userId, type) => {
		const provider = LOCAL_PROVIDERS[type];
		if (!provider) throw new Error(`Local agents only write text, not ${type}`);
		return provider();
	},
	recordSpend: async () => {},
};

const isByokPick = (picked: ModelRef): picked is BYOKModelRef =>
	isByokProvider(picked.provider);

/** For the worker, which serves both families from one queue: the one place the server branches on the family. */
export const providerForPick = <K extends ProviderType>(
	userId: string,
	type: K,
	picked: ModelRef,
): Promise<Providers[K]> =>
	isByokPick(picked)
		? BYOK.providerFor(userId, type, picked)
		: HOSTED.providerFor(userId, type, picked);
