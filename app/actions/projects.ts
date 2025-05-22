"use server";
import db from "@/app/db";
import {
  clients,
  onboarding,
  projects,
  userProjects,
  onboardingFormAnswers,
  onboardingQuestions,
} from "@/app/db/schema";
import { eq, inArray, and, or, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getActiveProjects() {
  const activeProjects = await db.query.projects.findMany({
    where: or(eq(projects.status, "active"), eq(projects.status, "pending")),
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

export async function addClient(client: typeof clients.$inferInsert) {
  const [newClient] = await db.insert(clients).values(client).returning();
  return newClient;
}

export async function removeClient(clientId: number) {
  await db.delete(clients).where(eq(clients.id, clientId));
}

export async function updateProjectInfo(
  projectId: number,
  data: {
    name?: string;
    description?: string;
    websiteUrl?: string;
  }
) {
  console.log("Updating project info", data);
  const [updatedProject] = await db
    .update(projects)
    .set({
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  revalidatePath(`/projects/${projectId}`);
  return updatedProject;
}

export async function getProjectClients(projectId: number) {
  const projectClients = await db.query.clients.findMany({
    where: eq(clients.projectId, projectId),
  });
  return projectClients;
}

export async function addClientToProject(
  client: Omit<typeof clients.$inferInsert, "projectId"> & { projectId: number }
) {
  const [newClient] = await db.insert(clients).values(client).returning();
  revalidatePath(`/projects/${client.projectId}`);
  return newClient;
}

export async function removeClientFromProject(clientId: number) {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
  });

  await db.delete(clients).where(eq(clients.id, clientId));

  if (client) {
    revalidatePath(`/projects/${client.projectId}`);
  }

  return { success: true };
}

export async function getProjectDetails(projectId: number) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return null;
  }

  const projectClients = await db.query.clients.findMany({
    where: eq(clients.projectId, projectId),
  });

  // Get the latest onboarding record for this project
  const latestOnboarding = await db.query.onboarding.findFirst({
    where: eq(onboarding.projectId, projectId),
    orderBy: (onboarding, { desc }) => [desc(onboarding.createdAt)],
    with: {
      questions: {
        with: {
          question: true,
        },
        orderBy: (onboardingQuestions, { asc }) => [
          asc(onboardingQuestions.order),
        ],
      },
      answers: {
        with: {
          question: true,
        },
        orderBy: (onboardingFormAnswers, { asc }) => [
          asc(onboardingFormAnswers.questionId),
        ],
      },
    },
  });

  // Transform the Q&A data into the format expected by the UI
  const qaItems =
    latestOnboarding?.answers.map((answer) => ({
      questionId: answer.questionId,
      question: answer.question.label,
      answer: answer.answer || "",
      type: answer.question.type,
    })) || [];

  return {
    project,
    clients: projectClients.map((client) => ({
      id: client.id.toString(),
      name: client.name,
      email: client.email,
      role: client.role,
      linkedinUrl: client.linkedinUrl,
      avatar: "/placeholder.svg?height=40&width=40", // Default avatar
    })),
    qaItems,
  };
}

export async function updateClient(
  clientId: number,
  data: {
    name?: string;
    email?: string;
    role?: string | null;
    linkedinUrl?: string | null;
  }
) {
  const [updatedClient] = await db
    .update(clients)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, clientId))
    .returning();

  if (updatedClient) {
    revalidatePath(`/projects/${updatedClient.projectId}`);
  }

  return updatedClient;
}

export async function updateQAItem(
  projectId: number,
  questionId: number,
  answer: string
) {
  // First, get the latest onboarding record for this project
  const latestOnboarding = await db.query.onboarding.findFirst({
    where: eq(onboarding.projectId, projectId),
    orderBy: (onboarding, { desc }) => [desc(onboarding.createdAt)],
  });

  if (!latestOnboarding) {
    throw new Error("No onboarding record found for this project");
  }

  const [updatedAnswer] = await db
    .update(onboardingFormAnswers)
    .set({
      answer,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(onboardingFormAnswers.questionId, questionId),
        eq(onboardingFormAnswers.onboardingId, latestOnboarding.id)
      )
    )
    .returning();

  if (updatedAnswer) {
    revalidatePath(`/projects/${projectId}`);
  }

  return updatedAnswer;
}

export async function deleteQAItem(projectId: number, questionId: number) {
  // First, get the latest onboarding record for this project
  const latestOnboarding = await db.query.onboarding.findFirst({
    where: eq(onboarding.projectId, projectId),
    orderBy: (onboarding, { desc }) => [desc(onboarding.createdAt)],
  });

  if (!latestOnboarding) {
    throw new Error("No onboarding record found for this project");
  }

  // Delete the answer
  await db
    .delete(onboardingFormAnswers)
    .where(
      and(
        eq(onboardingFormAnswers.questionId, questionId),
        eq(onboardingFormAnswers.onboardingId, latestOnboarding.id)
      )
    );

  // Delete the question-onboarding relation
  await db
    .delete(onboardingQuestions)
    .where(
      and(
        eq(onboardingQuestions.questionId, questionId),
        eq(onboardingQuestions.onboardingId, latestOnboarding.id)
      )
    );

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectStatus(projectId: number, status: string) {
  try {
    const result = await db
      .update(projects)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    revalidatePath(`/projects/${projectId}`);
    return result[0];
  } catch (error) {
    console.error("Error updating project status:", error);
    return null;
  }
}
