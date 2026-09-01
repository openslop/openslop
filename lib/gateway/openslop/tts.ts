import { HttpTTSGateway } from "../http";
import { OPENSLOP_API_PREFIX } from "./base";

export class OpenSlopTTSGateway extends HttpTTSGateway {
	protected readonly apiPrefix = OPENSLOP_API_PREFIX;
}
