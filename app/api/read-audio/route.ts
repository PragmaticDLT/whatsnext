import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const speechFile = path.resolve("./public/speech.mp3");

export async function POST(request: NextRequest) {
    try {
        const { response } = await request.json();
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: response,
        });
        // console.log(speechFile);
        const buffer = Buffer.from(await mp3.arrayBuffer());

        // await fs.promises.writeFile(speechFile, buffer);

        // return Response.json({ audioUrl: speechFile });
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": "inline; filename=speech.mp3",
            },
        });
    } catch (error) {
        console.error("Error generating MP3:", error);
        return new NextResponse(JSON.stringify({ error: error }), {
            status: 500,
        });
    }

}