"use client";

import { Card } from "@/components/ui/card";

export function SnapshotSummary() {
  return (
    <section className="mb-8">
      <Card className="p-6 shadow-sm bg-[var(--background-dark)/10] border-[var(--border-dark)]">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Left Column (70%) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
                Project Status
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                The website redesign project is currently in the design phase.
                Initial wireframes have been approved, and the team is now
                working on high-fidelity mockups. Client feedback has been
                positive, but there are concerns about the timeline for the
                development phase.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
                Top 3 Next Actions
              </h3>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Complete homepage design by May 15</span>
                </li>
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Schedule design review meeting with client</span>
                </li>
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Finalize content requirements for product pages</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
                Open Questions
              </h3>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>
                    Will the client provide product photography or should we
                    source stock images?
                  </span>
                </li>
                <li className="flex gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Do we need to support IE11 for this project?</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column (30%) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
                Project Phase
              </h3>
              <div className="text-sm px-3 py-2 bg-[var(--background-dark)] text-[var(--text-primary)] border border-[var(--border-accent)] rounded-md inline-block">
                Design (2 of 4)
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
                Client Contact
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium text-[var(--text-primary)]">
                  Sarah Johnson
                </p>
                <p className="text-[var(--text-secondary)]">
                  sarah@acmeinc.com
                </p>
                <p className="text-[var(--text-secondary)]">(555) 123-4567</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
                Last Loom Sent
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                May 8, 2025 (2 days ago)
              </p>
              <p className="text-sm text-[var(--text-primary)] mt-1 cursor-pointer hover:text-[var(--text-secondary)] transition-colors">
                View recording →
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
