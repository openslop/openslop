import { describe, expect, it } from "vitest";
import { resolveAttributeSchema } from "../../factory";
import { listModels } from "../../models";
import { CONNECTOR_TYPES } from "../../types";

describe.each(CONNECTOR_TYPES)("the %s catalog", (type) => {
	it("shares its base attributes across every model", () => {
		const [first, ...rest] = listModels(type).map(
			(model) => resolveAttributeSchema(type, model).baseDefs,
		);
		for (const defs of rest) expect(defs).toEqual(first);
	});
});
