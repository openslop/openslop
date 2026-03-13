export class OpenSlopClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl?: string, token?: string) {
    this.baseUrl = baseUrl || "";
    this.token = token;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (this.token) h["authorization"] = `Bearer ${this.token}`;
    return h;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok)
      throw new Error(`OpenSlop API error: ${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined),
      ).toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`OpenSlop API error: ${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  async postBinary(path: string, body: unknown): Promise<ArrayBuffer> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok)
      throw new Error(`OpenSlop API error: ${res.status} ${res.statusText}`);
    return res.arrayBuffer();
  }

  async postStream(path: string, body: unknown): Promise<Response> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok)
      throw new Error(`OpenSlop API error: ${res.status} ${res.statusText}`);
    return res;
  }
}
