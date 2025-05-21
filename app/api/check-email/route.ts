// pages/api/check-email.ts or app/api/check-email/route.ts depending on your Next.js version

import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Use Clerk's backend API to search for users with this email
    // This won't trigger any redirects since it's a server-side operation
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
    });

    // If we found any users with this email, it exists
    const exists = users.data.length > 0;

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}
