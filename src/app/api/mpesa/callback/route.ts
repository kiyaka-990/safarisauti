import { NextResponse } from "next/server";
import { emit } from "@/lib/events";

export async function POST(req: Request) {
  const body = await req.json();
  const result = body?.Body?.stkCallback;
  emit(
    "pay",
    `Daraja callback: ResultCode=${result?.ResultCode} Desc=${result?.ResultDesc ?? "n/a"}`
  );
  // Acknowledge receipt to Safaricom.
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
