import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { user: string } }
) {
  const userId = params.user;
  const body = await request.json();
  console.log("User ID:", userId);
  console.log("Request body:", body);

  return NextResponse.json({ message: "Hello, world!" });
}
