import { badRequest } from "./response";

export function validateModel(
  model: string | undefined,
  models: Record<string, string>,
) {
  if (!model) return null;
  const valid = Object.values(models);
  if (!valid.includes(model))
    return badRequest(`Invalid model. Supported: ${valid.join(", ")}`);
  return null;
}
