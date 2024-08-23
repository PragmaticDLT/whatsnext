import OpenAI from "openai";
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Send a new message to a thread
export async function POST(request, { params: { threadId } }) {
  const { content, assistant_id } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistant_id,
  });

  return new Response(stream.toReadableStream());
}
