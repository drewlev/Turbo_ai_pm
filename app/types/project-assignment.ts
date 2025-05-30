// app/types/project-assignment.ts

export type ProjectAssignment = {
    designerName: string;
    designerRole: string;
    designerAvatar?: string; // Optional avatar URL
    projectName: string;
    projectClient: string;
    projectDeadline: string;
    projectPriority: 'Low' | 'Medium' | 'High';
    projectProgress: number;
    projectStatusColor: string; // Tailwind class like "bg-yellow-500"
  };