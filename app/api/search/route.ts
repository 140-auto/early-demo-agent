const DEMO_AGENT_URL = `${process.env.DEMO_AGENT_API_URL}/api/demo-agent/`;
const REQUEST_TIMEOUT_MS = 360_000; // 6 minutes overall ceiling
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 2_000;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      // Don't retry client errors (4xx) — only retry 5xx
      if (res.ok || res.status < 500) return res;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, INITIAL_BACKOFF_MS * 2 ** attempt));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      // AbortError means the overall timeout fired — don't retry, just throw
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      await new Promise((r) => setTimeout(r, INITIAL_BACKOFF_MS * 2 ** attempt));
    }
  }
  throw new Error('Unreachable');
}

export async function POST(request: Request) {
  const { query } = await request.json();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const backendResponse = await fetchWithRetry(DEMO_AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query }),
      signal: controller.signal,
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      const message =
        error?.error?.message || 'Failed to process your query. Please try again.';
      return Response.json(
        { error: message },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();

    return Response.json({
      response: data.response,
      conversationId: data.conversation_id,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return Response.json(
        { error: 'The request timed out. The agent took too long to respond.' },
        { status: 504 },
      );
    }
    console.error('Search proxy failed:', error);
    return Response.json(
      { error: 'Failed to reach the AI agent backend.' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
