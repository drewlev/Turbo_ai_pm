"use server";
import db from "@/app/db";
import { onboarding, projects, userProjects } from "@/app/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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
  // 1. Insert the project
  const [newProject] = await db.insert(projects).values(project).returning();

  if (!newProject) throw new Error("Failed to create project");

  // 2. Create a slug from the company name + nanoid
  const slugBase =
    project.name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "project";
  // const slug = `${slugBase}`;

  // 3. Create the onboarding record
  const [newOnboarding] = await db
    .insert(onboarding)
    .values({
      projectId: newProject.id,
      slug: slugBase,
      status: "pending",
    })
    .returning();

  return {
    project: newProject,
    onboarding: newOnboarding,
    onboardingLink: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${slugBase}`,
  };
}

export async function updateProjectUsers(
  userIds: number[],
  projectId: number,
  operation: "add" | "remove"
) {
  if (operation === "add") {
    const values = userIds.map((userId) => ({ userId, projectId }));
    const [newUserProjects] = await db
      .insert(userProjects)
      .values(values)
      .returning();
    return newUserProjects;
  } else {
    await db
      .delete(userProjects)
      .where(
        and(
          inArray(userProjects.userId, userIds),
          eq(userProjects.projectId, projectId)
        )
      );
    return null;
  }
}

export async function getProjectUsers(projectId: number) {
  const users = await db.query.userProjects.findMany({
    where: eq(userProjects.projectId, projectId),
  });
  return users;
}

export async function getAvailableUsers() {
  const users = await db.query.users.findMany();
  return users;
}
