import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { error, type } = await request.json();

  try {
    const errorPrisma = await prisma.errorLog.create({
      data: {
        error,
        type,
      },
    });
    NextResponse.json({ msg: "Error saved" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Some error ocurred" }, { status: 500 });
  }
}
