import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { url, method, body } = await request.json();
  console.log(url, method, body);
  return NextResponse.json({ message: "Hello, world!" });
}