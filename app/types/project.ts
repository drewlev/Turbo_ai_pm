export type Client = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  linkedinUrl: string | null;
  avatar: string;
};

export type ProjectInfo = {
  projectName: string;
  websiteUrl: string | null;
  description: string;
};

export type QAItem = {
  questionId: number;
  question: string;
  answer: string;
  type: "text" | "email" | "url" | "textarea";
};

export type SettingsSectionProps = {
  projectDetails: {
    project: {
      id: number;
      name: string;
      description: string | null;
      websiteUrl: string | null;
      status: string;
    };
    clients: Client[];
    qaItems: QAItem[];
  };
};

export type NewClient = {
  name: string;
  email: string;
  linkedinUrl: string;
  role: string;
};
