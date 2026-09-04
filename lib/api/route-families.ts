import type { z } from "zod";
import {
	isByokProvider,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { ModelRef, ModelTable } from "@/lib/connectors/types";
import type { ProviderType, Providers } from "@/lib/providers/types";
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
 * route lets in, how it names its models, and whose key a picked model runs
 * on. A route picks a family and its models; nothing else about it varies.
 */
export type RouteFamily<TModels, TPicked extends ModelRef> = {
	createHandler: typeof createApiRouteHandler;
	createQueryHandler: typeof createApiQueryRouteHandler;
	createParamHandler: typeof createApiParamRouteHandler;
	model: (models: TModels) => z.ZodType<TPicked>;
	providerFor: <K extends ProviderType>(
		userId: string,
		type: K,
		picked: TPicked,
	) => Promise<Providers[K]>;
};

export const HOSTED: RouteFamily<ModelTable, ModelRef> = {
	createHandler: createApiRouteHandler,
	createQueryHandler: createApiQueryRouteHandler,
	createParamHandler: createApiParamRouteHandler,
	model: hostedModel,
	providerFor: async (_userId, type, picked) =>
		hostedProviderFor(type, picked.model),
};

export const BYOK: RouteFamily<
	Partial<Record<BYOKProvider, ModelTable>>,
	BYOKModelRef
> = {
	createHandler: createSessionRouteHandler,
	createQueryHandler: createSessionQueryRouteHandler,
	createParamHandler: createSessionParamRouteHandler,
	model: byokModel,
	providerFor: (userId, type, picked) =>
		byokProviderFor(userId, picked.provider, type),
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
