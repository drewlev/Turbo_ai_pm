"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MeetingsSummary() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
        Meeting History
      </h2>

      {/* Upcoming Meeting */}
      <Card className="p-4 mb-4 bg-[var(--background-dark)] border-[var(--border-accent)]">
        <div className="flex items-start gap-3">
          <CalendarIcon className="h-5 w-5 text-[var(--text-primary)] mt-1" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">
                  Upcoming: Design Review
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  May 15, 2025 • 10:00 AM - 11:30 AM
                </p>
              </div>
              <Badge className="bg-[var(--background-dark)] text-[var(--text-primary)] hover:bg-[var(--border-accent)] border-[var(--border-accent)]">
                Join Zoom
              </Badge>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2 text-[var(--text-primary)]">
                Meeting Prep
              </h4>
              <ul className="space-y-1">
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>📋</span>
                  <span>Prepare all homepage mockups</span>
                </li>
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>⚠️</span>
                  <span>Address client concerns about mobile navigation</span>
                </li>
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>🔍</span>
                  <span>Review competitor analysis findings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Past Meetings */}
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="p-4 bg-[var(--background-dark)] border-[var(--border-dark)]"
          >
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-[var(--text-secondary)] mt-1" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {meeting.date}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs border-[var(--border-accent)] text-[var(--text-secondary)]"
                  >
                    {meeting.duration}
                  </Badge>
                </div>

                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-1 text-[var(--text-primary)]">
                    Summary
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    {meeting.summary}
                  </p>

                  {meeting.decisions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1 text-[var(--text-primary)]">
                        Key Decisions
                      </h4>
                      <ul className="space-y-1">
                        {meeting.decisions.map((decision, index) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm text-[var(--text-secondary)]"
                          >
                            <span>✅</span>
                            <span>{decision}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meeting.actions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-[var(--text-primary)]">
                        Action Items
                      </h4>
                      <ul className="space-y-1">
                        {meeting.actions.map((action, index) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm text-[var(--text-secondary)]"
                          >
                            <span>📌</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

// Sample data
const meetings = [
  {
    id: "1",
    title: "Wireframe Review",
    date: "May 10, 2025 • 11:00 AM",
    duration: "1h 15m",
    summary:
      "Reviewed all wireframes with the client. Overall positive feedback with some minor adjustments needed for the product listing pages.",
    decisions: [
      "Approved homepage wireframe",
      "Decided to use a grid layout for product listings",
      "Will implement breadcrumb navigation",
    ],
    actions: [
      "Designer to update product page wireframes by May 12",
      "Client to provide final content requirements by May 15",
      "PM to schedule next design review for high-fidelity mockups",
    ],
  },
  {
    id: "2",
    title: "Project Kickoff",
    date: "May 1, 2025 • 10:00 AM",
    duration: "1h 30m",
    summary:
      "Initial project kickoff with the client team. Discussed project goals, timeline, and deliverables.",
    decisions: [
      "Confirmed project scope and timeline",
      "Agreed on weekly progress updates",
      "Selected primary contact persons",
    ],
    actions: [
      "Designer to create initial wireframes by May 8",
      "PM to set up project management tools and share access",
      "Client to provide brand guidelines by May 3",
    ],
  },
];
