import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createUser } from "@/app/actions/users";

// The webhook secret is set in the Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  console.log("🔔 Webhook received");

  // Get the headers
  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  console.log("🔑 Validating Svix signature...");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log("❌ Missing Svix headers");
    return new NextResponse("Missing Svix headers", { status: 401 });
  }

  // Get the body
  const payload = await request.text();
  const body = JSON.stringify(JSON.parse(payload));

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
    if (!evt) {
      console.log("❌ Svix signature validation failed");
      return new NextResponse("Svix signature validation failed", {
        status: 401,
      });
    }
    console.log("✅ Svix signature validated");

    const { type, data } = JSON.parse(payload);
    console.log("📦 Webhook type:", type);
    console.log("📄 Webhook data:", JSON.stringify(data, null, 2));

    switch (type) {
      case "user.created": {
        console.log("👤 Processing user.created event");

        // Get the free tier

        // Insert the new user into our database
        const userToInsert = {
          clerkId: data.id as string,
          email: data.email_addresses[0].email_address as string,
          name: (data.first_name + " " + data.last_name) as string,
          // password: data.password as string,
        };
        console.log("📝 Inserting user data:", userToInsert);

        await createUser(userToInsert);
        console.log("✅ User successfully inserted into database");
        break;
      }
    }

    console.log("✨ Webhook processed successfully");
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    const error = err as Error;
    if (error.message.includes("duplicate key value violates unique constraint")) {
      return new NextResponse(null, { status: 200 });
    }
    console.error("❌ Error processing webhook:", {
      message: error.message,
      stack: error.stack,
    });
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
}
