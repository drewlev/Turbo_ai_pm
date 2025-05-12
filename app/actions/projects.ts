import db from "@/app/db";
import { projects } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveProjects() {
  const activeProjects = await db.query.projects.findMany({
    where: eq(projects.status, "active"),
  });
  return activeProjects;
}

export async function getProjectById(id: number) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  return project;
}

export async function createProject(project: typeof projects.$inferInsert) {
  const [newProject] = await db.insert(projects).values(project).returning();
  return newProject;
}
