import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { response } = await request.json();
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: response,
        });
        // console.log(speechFile);
        // const buffer = Buffer.from(await mp3.arrayBuffer());

        return new NextResponse(mp3.body, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": "inline; filename=speech.mp3",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Error generating MP3:", error);
        return new NextResponse(JSON.stringify({ error: error }), {
            status: 500,
        });
    }

}