import { OpenSlopClient } from "@/lib/clients/openslop";
import { GatewayClient } from "../base";

export abstract class OpenSlopGatewayClient<
  TParams = unknown,
  TResult = unknown,
> extends GatewayClient<TParams, TResult> {
  protected client: OpenSlopClient;

  constructor(baseUrl?: string) {
    super();
    this.client = new OpenSlopClient(baseUrl);
  }
}
