import { describe, expect, it } from "vitest";
import { resolveAttributeSchema } from "@/lib/connectors/factory";
import { listModels } from "@/lib/connectors/models";
import { CONNECTOR_TYPES } from "@/lib/connectors/types";

describe.each(CONNECTOR_TYPES)("the %s catalog", (type) => {
	it("shares its base attributes across every model", () => {
		const [first, ...rest] = listModels(type).map(
			(model) => resolveAttributeSchema(type, model).baseDefs,
		);
		for (const defs of rest) expect(defs).toEqual(first);
	});
});
