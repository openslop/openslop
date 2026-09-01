import { HttpLLMGateway } from "../http";
import { OPENSLOP_API_PREFIX } from "./base";

export class OpenSlopLLMGateway extends HttpLLMGateway {
	protected readonly apiPrefix = OPENSLOP_API_PREFIX;
}
