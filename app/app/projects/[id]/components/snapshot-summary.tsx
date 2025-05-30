"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Circle } from "lucide-react";
// import type { ReactNode } from "react";

export function SnapshotSummary() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* <div className="flex flex-col p-4 text-white bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg">
        <SnapshotRow label="Project Phase">
          <span className="text-sm">Design 2/4</span>
        </SnapshotRow>
        <SnapshotRow label="Client Contact">
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-4 w-4">
              <AvatarImage
                src="/placeholder.svg?height=20&width=20"
                alt="Alex Levine"
              />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span>Alex Levine</span>
            <span className="text-[#6e6a68] ml-2">alex@rallyhq.com</span>
          </div>
        </SnapshotRow>
        <SnapshotRow label="Last Loom Sent" className="mb-0">
          <div className="flex items-center text-sm">
            <span>May 8, 2025 (2 days ago)</span>
            <Link
              href="#"
              className="text-[#dd743b] text-xs flex items-center ml-2"
            >
              View Recording <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </SnapshotRow>
      </div> */}

      <div className="grid grid-cols-3 gap-4 t">
        <ProjectUpdateCard
          title="Project Status"
          updates={[
            "The project is progressing as expected. Wireframes are approved",
            "Mockups are in review",
            "Client feedback is positive",
            "Timeline concerns remain",
          ]}
          icon={<Circle className="h-3 w-3 fill-[#5092e0] text-[#5092e0]" />}
        />

        <ProjectUpdateCard
          title="Project Status"
          updates={[
            "The project is progressing as expected. Wireframes are approved",
            "Mockups are in review",
            "Client feedback is positive",
            "Timeline concerns remain",
          ]}
          icon={<Circle className="h-3 w-3 fill-[#5092e0] text-[#5092e0]" />}
        />

        <ProjectUpdateCard
          title="Project Status"
          updates={[
            "The project is progressing as expected. Wireframes are approved",
            "Mockups are in review",
            "Client feedback is positive",
            "Timeline concerns remain",
          ]}
          icon={<Circle className="h-3 w-3 fill-[#5092e0] text-[#5092e0]" />}
        />
      </div>
    </div>
  );
}

// Component for rendering a label/content row
// type SnapshotRowProps = {
//   label: string;
//   children: ReactNode;
//   className?: string;
// };

// function SnapshotRow({
//   label,
//   children,
//   className = "mb-4",
// }: SnapshotRowProps) {
//   return (
//     <div className={`flex items-center ${className}`}>
//       <div className="w-36 text-xs text-[#6e6a68]">{label}</div>
//       <div className="flex-1">{children}</div>
//     </div>
//   );
// }

const ProjectUpdateCard = ({
  title,
  updates,
  icon,
}: {
  title: string;
  updates: string[];
  icon: React.ReactNode;
}) => {
  return (
    // Card container with dark background, white text, rounded corners, and padding
    <Card className="w-full max-w-md bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg gap-2">
      <CardHeader className="flex items-center gap-2">
        {/* Custom blue square icon or passed-in icon */}
        {icon}
        {/* Card title with white text and bold font */}
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Unordered list for updates, with no default list style and increased vertical spacing */}
        <ul className="list-none space-y-2 text-white">
          {updates.map((update, idx) => (
            // Each list item is relative for positioning the custom bullet
            <li key={idx} className="relative pl-4 text-sm">
              {/* Custom dark gray bullet point, aligned to the top of the line */}
              <span className="absolute left-0 top-1.75 w-1.5 h-1.5 bg-[var(--border-accent)] rounded-full"></span>
              {update}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
