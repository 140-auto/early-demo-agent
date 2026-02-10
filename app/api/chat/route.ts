const DEMO_AGENT_URL = `${process.env.DEMO_AGENT_API_URL}/api/demo-agent/`;
const REQUEST_TIMEOUT_MS = 120_000;

export async function POST(request: Request) {
  const { message, conversationId } = await request.json();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const body: { message: string; conversation_id?: string } = { message };
    if (conversationId) {
      body.conversation_id = conversationId;
    }

    const backendResponse = await fetch(DEMO_AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      const message =
        error?.error?.message || 'Failed to process your message. Please try again.';
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
    console.error('Chat proxy failed:', error);
    return Response.json(
      { error: 'Failed to reach the AI agent backend.' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
