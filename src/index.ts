type CfProps = {
  asn?: number;
  asOrganization?: string;
  continent?: string;
  country?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  postalCode?: string;
  metroCode?: string;
  latitude?: string | number;
  longitude?: string | number;
  timezone?: string;
  colo?: string;
  clientTcpRtt?: number;
  httpProtocol?: string;
  tlsVersion?: string;
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const respond = (body: string | object, json: boolean, head = false) => {
      const headers = {
        "cache-control": "no-store",
        "content-type": json ? "application/json; charset=utf-8"
                             : "text/plain; charset=utf-8",
      };
      if (head) return new Response(null, { headers });
      return new Response(json ? JSON.stringify(body) + "\n" : String(body), { headers });
    };

    // --- IP extraction (force IPv4 when present)
    const ipv4Re = /(\d{1,3}\.){3}\d{1,3}/;
    const candidates = [
      request.headers.get("cf-connecting-ip"),
      ...(request.headers.get("x-forwarded-for")?.split(",").map(s => s.trim()) ?? []),
      request.headers.get("x-real-ip"),
    ].filter(Boolean) as string[];

    const ipv4 = candidates.map(c => c.match(ipv4Re)?.[0]).find(Boolean);
    const ip = ipv4 ?? candidates[0] ?? "0.0.0.0";

    // --- Negotiation
    const qType = url.searchParams.get("type")?.toLowerCase();
    const accept = (request.headers.get("accept") || "").toLowerCase();
    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    const forceJson = qType === "json";
    const forceText = qType === "text";
    const headerWantsJson =
      accept.includes("application/json") ||
      contentType.includes("application/json") ||
      accept.includes("json");
    const respondJson = forceJson || (!forceText && headerWantsJson);

    // --- /details endpoint
    if (path === "/details") {
      const cf = (request as any).cf as CfProps | undefined;

      const details = {
        ip,
        asn: cf?.asn ?? null,
        isp: cf?.asOrganization ?? null,
        continent: cf?.continent ?? null,
        country: cf?.country ?? null,
        region: cf?.region ?? cf?.regionCode ?? null,
        city: cf?.city ?? null,
        postalCode: cf?.postalCode ?? null,
        latitude: cf?.latitude ?? null,
        longitude: cf?.longitude ?? null,
        timezone: cf?.timezone ?? null,
        // extra diagnostics (optional):
        colo: cf?.colo ?? null,
        clientTcpRtt: cf?.clientTcpRtt ?? null,
        httpProtocol: cf?.httpProtocol ?? null,
        tlsVersion: cf?.tlsVersion ?? null,
      };

      if (request.method === "HEAD") return respond("", respondJson, true);

      if (forceText) {
        // simple plaintext dump
        const lines = Object.entries(details)
          .map(([k, v]) => `${k}: ${v ?? ""}`)
          .join("\n") + "\n";
        return respond(lines, false);
      }
      return respond(details, true);
    }

    // --- root endpoint: just IP
    if (request.method === "HEAD") return respond("", respondJson, true);
    if (respondJson) return respond({ ip }, true);
    return respond(ip + "\n", false);
  },
};
