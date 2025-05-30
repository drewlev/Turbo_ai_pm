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
import { eq, inArray, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateProjectSlug } from "@/app/schemas/project";
import type { ProjectFormData, ProjectUpdateData } from "@/app/schemas/project";

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

export async function createProject(data: ProjectFormData) {
  // 1. Insert the project
  const [newProject] = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description,
      websiteUrl: data.websiteUrl,
      status: "pending",
    })
    .returning();

  if (!newProject) throw new Error("Failed to create project");

  // 2. Create the onboarding record with consistent slug
  const slug = generateProjectSlug(data.name, newProject.id);
  const [newOnboarding] = await db
    .insert(onboarding)
    .values({
      projectId: newProject.id,
      slug,
      status: "pending",
    })
    .returning();

  // 3. Add clients if any
  if (data.clients.length > 0) {
    await db.insert(clients).values(
      data.clients.map((client) => ({
        projectId: newProject.id,
        name: client.name,
        email: client.email || "",
        linkedinUrl: client.linkedin || null,
      }))
    );
  }

  return {
    project: newProject,
    onboarding: newOnboarding,
    onboardingLink: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${slug}`,
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
  data: ProjectUpdateData
) {
  const [updatedProject] = await db
    .update(projects)
    .set({
      ...data,
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

    // Revalidate both the specific project page and the entire app layout
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/", "layout");

    return result[0];
  } catch (error) {
    console.error("Error updating project status:", error);
    return null;
  }
}

export async function revalidateProjectPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/app", "layout");
  revalidatePath("/app/projects", "page");
}
