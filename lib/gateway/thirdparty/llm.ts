import { HttpLLMGateway } from "../http";
import { THIRD_PARTY_API_PREFIX } from "./base";

export class ThirdPartyLLMGateway extends HttpLLMGateway {
	protected readonly apiPrefix = THIRD_PARTY_API_PREFIX;
}
