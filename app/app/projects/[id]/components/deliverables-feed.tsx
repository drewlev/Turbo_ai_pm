import type React from "react";
import { Card } from "@/components/ui/card";

export function DeliverablesFeed() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
        Recent Deliverables
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliverables.map((deliverable) => (
          <Card
            key={deliverable.id}
            className="overflow-hidden bg-[var(--background-dark)] border-[var(--border-dark)]"
          >
            <div className="aspect-video bg-[var(--border-dark)] relative flex items-center justify-center">
              <img
                src={deliverable.thumbnail || "/placeholder.svg"}
                alt={deliverable.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <PlayIcon className="w-12 h-12 text-[var(--text-primary)] opacity-80" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {deliverable.title}
                </h3>
                <span className="text-xs text-[var(--text-secondary)]">
                  {deliverable.date}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {deliverable.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

// Sample data
const deliverables = [
  {
    id: "1",
    title: "Homepage Design Walkthrough",
    date: "May 8, 2025",
    description:
      "Detailed explanation of the homepage design concepts and navigation structure.",
    thumbnail: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "2",
    title: "Mobile Responsive Approach",
    date: "May 5, 2025",
    description:
      "Overview of how the design will adapt to different screen sizes and devices.",
    thumbnail: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "3",
    title: "Color Palette & Typography",
    date: "May 1, 2025",
    description:
      "Explanation of the selected color schemes and font choices for the brand.",
    thumbnail: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "4",
    title: "Initial Wireframes Review",
    date: "Apr 25, 2025",
    description:
      "Walkthrough of the low-fidelity wireframes and site structure.",
    thumbnail: "/placeholder.svg?height=200&width=400",
  },
];
