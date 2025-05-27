"use server";

import { useAuth } from "@clerk/nextjs";
import FirefliesSettings from "@/app/app/settings/_components/fireflies-settings";
import { getFirefliesWebhookUrl, hasFirefliesApiKey } from "@/app/actions/fireflies";

export default async function SettingsPage() {
  const webhookId = await getFirefliesWebhookUrl();
  const hasKey = await hasFirefliesApiKey();
  return (
    <div className="p-4 bg-[var(--background-dark)] h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
        Settings
      </h1>

      <div className="space-y-4">
        <FirefliesSettings webhookId={webhookId} hasKey={hasKey}/>
      </div>
    </div>
  );
}
