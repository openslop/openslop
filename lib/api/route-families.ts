import pick from "lodash/pick";
import type { z } from "zod";
import { isByokProvider } from "@/lib/connectors/provider-catalog";
import type { ConnectorType, ModelRef } from "@/lib/connectors/types";
import type { ProviderType, Providers } from "@/lib/providers/types";
import { byokModel, hostedModel, type BYOKModelRef } from "./generation-schema";
import { bookLlmSpend } from "./jobs";
import { byokProviderFor } from "./providers/byok";
import { hostedProviderFor } from "./providers/openslop";
import {
	createApiParamRouteHandler,
	createApiQueryRouteHandler,
	createHostedRouteHandler,
	createSessionParamRouteHandler,
	createSessionQueryRouteHandler,
	createSessionRouteHandler,
} from "./route-handler";

/**
 * Everything that differs between the two route families, in one place: who a
 * route lets in, how it names its models, whose key a picked model runs on,
 * and whether its streamed LLM spend is booked. A route picks a family and a
 * connector type; nothing else about it varies.
 */
export type RouteFamily<TPicked extends ModelRef> = {
	createHandler: typeof createHostedRouteHandler;
	createQueryHandler: typeof createApiQueryRouteHandler;
	createParamHandler: typeof createApiParamRouteHandler;
	model: (type: ConnectorType) => z.ZodType<TPicked>;
	providerFor: <K extends ProviderType>(
		userId: string,
		type: K,
		picked: TPicked,
	) => Promise<Providers[K]>;
	recordSpend: (
		userId: string,
		picked: TPicked,
		costUsd: number,
	) => Promise<unknown>;
};

export const HOSTED: RouteFamily<ModelRef> = {
	createHandler: createHostedRouteHandler,
	createQueryHandler: createApiQueryRouteHandler,
	createParamHandler: createApiParamRouteHandler,
	model: hostedModel,
	providerFor: async (_userId, type, picked) =>
		hostedProviderFor(type, picked.model),
	recordSpend: (userId, picked, costUsd) =>
		bookLlmSpend({
			userId,
			request: pick(picked, "provider", "model"),
			costUsd,
		}),
};

export const BYOK: RouteFamily<BYOKModelRef> = {
	createHandler: createSessionRouteHandler,
	createQueryHandler: createSessionQueryRouteHandler,
	createParamHandler: createSessionParamRouteHandler,
	model: byokModel,
	providerFor: (userId, type, picked) =>
		byokProviderFor(userId, picked.provider, type),
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
