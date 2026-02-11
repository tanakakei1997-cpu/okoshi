import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const tempPath = path.join("/tmp", file.name);
  fs.writeFileSync(tempPath, buffer);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(tempPath),
    model: "gpt-4o-transcribe",
    language: "ja",
    response_format: "verbose_json",
    prompt: "日本語として自然な句読点を付けてください。",
  });

  return NextResponse.json({
    segments: transcription.segments,
  });
}
