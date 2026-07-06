import {
  parseProbeRequest,
  probeDns,
  probeHttp,
  probeKeyword,
  probeTls,
  validateTargetUrl,
} from "../../src/server/probe";

export async function GET(request: Request) {
  const { mode, targetUrl, keyword, timeoutMs } = parseProbeRequest(request);

  if (!validateTargetUrl(targetUrl)) {
    return Response.json({ error: "Invalid or missing url parameter" }, { status: 400 });
  }

  const url = targetUrl as string;

  try {
    if (mode === "dns") {
      return Response.json(await probeDns(url));
    }

    if (mode === "tls") {
      return Response.json(await probeTls(url));
    }

    if (mode === "keyword") {
      if (!keyword.trim()) {
        return Response.json({ error: "Missing keyword parameter" }, { status: 400 });
      }
      return Response.json(await probeKeyword(url, keyword, timeoutMs));
    }

    return Response.json(await probeHttp(url, timeoutMs));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy request failed";
    const status = error instanceof Error && error.name === "AbortError" ? 408 : 502;
    return Response.json({ error: message }, { status });
  }
}
