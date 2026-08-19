import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/dashboard/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const valid = isAdminRequest(typeof body.key === "string" ? body.key : null);
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
