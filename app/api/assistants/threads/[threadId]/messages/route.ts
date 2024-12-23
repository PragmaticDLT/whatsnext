import OpenAI from "openai";
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Send a new message to a thread
export async function POST(request, { params: { threadId } }) {
  const { content, assistant_id, isRefresh } = await request.json();

 await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: isRefresh
      ? `Change answer for the previous question, then continue with normal flow: ${content}`
      : content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistant_id,
  });

  // const textResponse = await new Promise<string>((resolve, reject) => {
  //   let result = "";
  //   stream.on("event", (chunk) => {
  //     if(chunk.event === "thread.message.completed") {
  //       result += chunk.data.text.value;
  //     }
  //   });
  //   stream.on("end", () => resolve(result));
  //   stream.on("error", reject);
  // });
  // console.log(textResponse, "textResponse")
  // const audioResponse = await openai.audio.speech.create({
  //   model: "tts-1",
  //   voice: "alloy",
  //   input: textResponse,
  // })
  // const audioBuffer = await audioResponse.arrayBuffer();

  // const boundary = "boundary";
  // const multipartStream = new ReadableStream({
  //   start(controller) {
  //     // Part 1: Text stream
  //     controller.enqueue(
  //       new TextEncoder().encode(
  //         `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({
  //           type: "text",
  //           data: textResponse,
  //         })}\r\n`
  //       )
  //     );

  //     // Part 2: Audio stream
  //     controller.enqueue(
  //       new TextEncoder().encode(
  //         `--${boundary}\r\nContent-Type: audio/mpeg\r\n\r\n`
  //       )
  //     );
  //     controller.enqueue(new Uint8Array(audioBuffer));

  //     // End of multipart
  //     controller.enqueue(new TextEncoder().encode(`\r\n--${boundary}--`));
  //     controller.close();
  //   },
  // });

  // return new Response(multipartStream, {
  //   headers: {
  //     "Content-Type": `multipart/mixed; boundary=${boundary}`,
  //   },
  // });

  return new Response(stream.toReadableStream());
}
