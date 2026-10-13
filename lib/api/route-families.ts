import type { User } from "@supabase/supabase-js";
import type { z } from "zod";
import { isByokProvider } from "@/lib/connectors/provider-catalog";
import type { ConnectorType, ModelRef } from "@/lib/connectors/types";
import type { ProviderType, Providers } from "@/lib/providers/types";
import { refuseOverBudget } from "./budget";
import { byokModel, hostedModel, type BYOKModelRef } from "./generation-schema";
import { byokProviderFor } from "./providers/byok";
import { hostedProviderFor } from "./providers/openslop";
import {
	createApiParamRouteHandler,
	createApiQueryRouteHandler,
	createApiRouteHandler,
	createSessionParamRouteHandler,
	createSessionQueryRouteHandler,
	createSessionRouteHandler,
} from "./route-handler";

/**
 * Everything that differs between the two route families, in one place: who a
 * route lets in, how it names its models, whose key a picked model runs on,
 * and what the account may spend on it. A route picks a family and a
 * connector type; nothing else about it varies.
 */
export type RouteFamily<TPicked extends ModelRef> = {
	createHandler: typeof createApiRouteHandler;
	createQueryHandler: typeof createApiQueryRouteHandler;
	createParamHandler: typeof createApiParamRouteHandler;
	model: (type: ConnectorType) => z.ZodType<TPicked>;
	providerFor: <K extends ProviderType>(
		userId: string,
		type: K,
		picked: TPicked,
	) => Promise<Providers[K]>;
	refuseOverBudget: (user: User) => Promise<Response | null>;
};

export const HOSTED: RouteFamily<ModelRef> = {
	createHandler: createApiRouteHandler,
	createQueryHandler: createApiQueryRouteHandler,
	createParamHandler: createApiParamRouteHandler,
	model: hostedModel,
	providerFor: async (_userId, type, picked) =>
		hostedProviderFor(type, picked.model),
	refuseOverBudget,
};

export const BYOK: RouteFamily<BYOKModelRef> = {
	createHandler: createSessionRouteHandler,
	createQueryHandler: createSessionQueryRouteHandler,
	createParamHandler: createSessionParamRouteHandler,
	model: byokModel,
	providerFor: (userId, type, picked) =>
		byokProviderFor(userId, picked.provider, type),
	refuseOverBudget: async () => null,
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
