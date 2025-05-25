import { z } from "zod";

const linkedinRegex =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  linkedin: z
    .string()
    .refine(
      (val) => !val || val.match(linkedinRegex),
      "Invalid LinkedIn URL. Please use a format like https://www.linkedin.com/in/your-profile or linkedin.com/in/your-profile"
    )
    .optional(),
  email: z
    .string()
    .refine(
      (val) => !val || val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      "Invalid email address"
    )
    .optional(),
});

export const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  websiteUrl: z.string().url("Invalid website URL").optional(),
  clients: z.array(clientSchema).default([]),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url("Invalid website URL").optional(),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>;
export type ClientData = z.infer<typeof clientSchema>;

// Utility function for generating slugs
export function generateProjectSlug(name: string, projectId?: number): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return projectId ? `${baseSlug}-${projectId}` : baseSlug;
}
