import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const audioBytes = await file.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);

    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], `audio.${file.type.split('/')[1]}`, { type: file.type }),
      model: 'whisper-1',
    });
    return NextResponse.json({ text: response.text });

  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Error processing audio file' },
      { status: 500 }
    );
  }
}


