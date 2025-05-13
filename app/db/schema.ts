import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  primaryKey,
  real,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("designer"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status"),
});

export const onboarding = pgTable("onboarding", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  slug: text("slug").notNull().unique(), // for link URL
  status: text("status").$type<"pending" | "submitted" | "expired">().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export const onboardingQuestions = pgTable("onboarding_questions", {
  id: serial("id").primaryKey(),
  onboardingId: integer("onboarding_id").references(() => onboarding.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dateString: timestamp("date_string").notNull(),
  duration: real("duration"),
  transcriptUrl: text("transcript_url"),
  audioUrl: text("audio_url"),
  videoUrl: text("video_url"),
  meetingLink: text("meeting_link"),
  projectId: integer("project_id"),
  firefliesMeetingId: text("fireflies_meeting_id"),
  firefliesEventType: text("fireflies_event_type"),
  firefliesClientReferenceId: text("fireflies_client_reference_id"),
});

export const speakers = pgTable(
  "speakers",
  {
    id: serial("id").primaryKey(),
    meetingId: integer("meeting_id").notNull(), // FK to meetings.id
    firefliesSpeakerId: integer("fireflies_speaker_id"),
    name: text("name").notNull(),
  },
  (table) => ({
    meetingSpeakerUnique: unique().on(
      table.meetingId,
      table.firefliesSpeakerId
    ),
  })
);

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(), // FK to meetings.id
  index: integer("index").notNull(),
  text: text("text").notNull(),
  startTime: real("start_time"),
  endTime: real("end_time"),
  speakerName: text("speaker_name"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  projectId: integer("project_id").references(() => projects.id),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
});

export const taskAssignees = pgTable(
  "task_assignees",
  {
    taskId: integer("task_id")
      .notNull() // Explicitly set NOT NULL
      .references(() => tasks.id),
    userId: integer("user_id")
      .notNull() // Explicitly set NOT NULL
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.userId] })]
);

// Relations

// User Relations
export const userRelations = relations(users, ({ many }) => ({
  taskAssignees: many(taskAssignees),
}));

// Project Relations
export const projectRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

// Task Relations
export const taskRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  taskAssignees: many(taskAssignees),
}));

// Task Assignee Relations
export const taskAssigneeRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignees.userId],
    references: [users.id],
  }),
}));

// Meeting Relations | Relations for Fireflies
export const participants = pgTable(
  "participants",
  {
    id: serial("id").primaryKey(),
    meetingId: integer("meeting_id").notNull(), // FK to meetings.id
    email: text("email").notNull(),
  },
  (table) => ({
    meetingEmailUnique: unique().on(table.meetingId, table.email),
  })
);

// Meeting Relations
export const meetingRelations = relations(meetings, ({ one, many }) => ({
  project: one(projects, {
    fields: [meetings.projectId],
    references: [projects.id],
  }),
  sentences: many(sentences),
  speakers: many(speakers),
  participants: many(participants),
}));

// Sentence Relations
export const sentenceRelations = relations(sentences, ({ one }) => ({
  meeting: one(meetings, {
    fields: [sentences.meetingId],
    references: [meetings.id],
  }),
}));

// Speaker Relations
export const speakerRelations = relations(speakers, ({ one }) => ({
  meeting: one(meetings, {
    fields: [speakers.meetingId],
    references: [meetings.id],
  }),
}));

// Participant Relations
export const participantRelations = relations(participants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [participants.meetingId],
    references: [meetings.id],
  }),
}));
