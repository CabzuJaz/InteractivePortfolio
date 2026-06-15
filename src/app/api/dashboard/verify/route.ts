import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const valid = body.key === process.env.DASHBOARD_ADMIN_KEY;
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
