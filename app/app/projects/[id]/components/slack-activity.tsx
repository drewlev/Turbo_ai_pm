import type React from "react";
import { Card } from "@/components/ui/card";

export function SlackActivity() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
        Slack Touchpoints
      </h2>

      <Card className="divide-y divide-[var(--border-dark)] bg-[var(--background-dark)] border-[var(--border-dark)] gap-0 py-0">
        {slackActivities.map((activity) => (
          <div key={activity.id} className="p-4 flex items-start gap-3 ">
            <SlackIcon className="h-5 w-5 text-[#E01E5A] mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm text-[var(--text-primary)]">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {activity.time}
                  </span>
                  <StatusBadge status={activity.status} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-primary)]">
        <CheckIcon className="h-3 w-3" /> Sent
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
        <AlertCircleIcon className="h-3 w-3" /> Failed
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--border-accent)]">
        <ClockIcon className="h-3 w-3" /> Pending
      </span>
    );
  }

  return null;
}

function SlackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="13" y="2" width="3" height="8" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect x="8" y="14" width="3" height="8" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect x="14" y="13" width="8" height="3" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
      <rect x="2" y="8" width="8" height="3" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Sample data
const slackActivities = [
  {
    id: "1",
    description: "Reminder sent: Design review meeting tomorrow at 10:00 AM",
    time: "Today, 4:30 PM",
    status: "sent",
  },
  {
    id: "2",
    description: "Notification: New wireframes uploaded to project files",
    time: "Today, 2:15 PM",
    status: "sent",
  },
  {
    id: "3",
    description: "Reminder: 2 deliverables due this week",
    time: "Yesterday, 9:00 AM",
    status: "sent",
  },
  {
    id: "4",
    description: "Weekly project status update",
    time: "May 5, 10:00 AM",
    status: "sent",
  },
  {
    id: "5",
    description: "Client feedback request: Homepage design",
    time: "May 3, 3:45 PM",
    status: "sent",
  },
];
