import type React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
interface Deliverable {
  id: string;
  title: string;
  date: string;
  description: string;
  thumbnail?: string;
  loomUrl?: string;
}

function LoomEmbed({ url }: { url: string }) {
  const videoId = url.split("/share/")[1]?.split("?")[0];

  if (!videoId) {
    return <div>Invalid Loom URL</div>;
  }

  const embedUrl = `https://www.loom.com/embed/${videoId}`;
  const iframeCode = `<iframe src="${embedUrl}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>`;

  return (
    <div
      style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}
    >
      <div dangerouslySetInnerHTML={{ __html: iframeCode }} />
    </div>
  );
}

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
            {deliverable.loomUrl ? (
              <div className="aspect-video bg-[var(--border-dark)] relative">
                <LoomEmbed url={deliverable.loomUrl} />
              </div>
            ) : (
              <div className="aspect-video bg-[var(--border-dark)] relative flex items-center justify-center">
                <Image
                  src={deliverable.thumbnail || "/placeholder.svg"}
                  alt={deliverable.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <PlayIcon className="w-12 h-12 text-[var(--text-primary)] opacity-80" />
                </div>
              </div>
            )}
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

// Updated Sample Data with a loomUrl
const deliverables: Deliverable[] = [
  {
    id: "1",
    title: "Homepage Design Walkthrough",
    date: "May 8, 2025",
    description:
      "Detailed explanation of the homepage design concepts and navigation structure.",
    loomUrl:
      "https://www.loom.com/share/903200708d25460899f05daff777fca4?sid=0698dfae-36ae-4b6a-beb2-694326f933c1",
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
