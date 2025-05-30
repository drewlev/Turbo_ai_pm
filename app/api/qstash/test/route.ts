import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  console.log("QStash test route");
  const requestBody = await request.json();
  console.log("requestBody", requestBody);
  return NextResponse.json({ message: "QStash test route" });
}