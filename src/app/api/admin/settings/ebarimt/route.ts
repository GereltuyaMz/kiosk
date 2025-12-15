import { NextRequest, NextResponse } from "next/server";
import { getEbarimtSettings, saveEbarimtSettings } from "@/lib/admin/settings/actions";
import type { EbarimtSettingsInput } from "@/lib/admin/settings/schemas";

export async function GET() {
  const result = await getEbarimtSettings();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ settings: result.data });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EbarimtSettingsInput;
    const result = await saveEbarimtSettings(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
