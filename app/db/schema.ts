import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  primaryKey,
  numeric,
  unique,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("designer"),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  firefliesApiKey: text("fireflies_api_key"),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
});

export const slackUsers = pgTable("slack_users", {
  id: serial("id").primaryKey(),
  slackUserId: text("slack_user_id").notNull().unique(),
  slackTeamId: text("slack_team_id").notNull(),
  slackTeamName: text("slack_team_name").notNull(),
  slackAccessToken: text("slack_access_token").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});

export const slackInstallations = pgTable("slack_installations", {
  slackTeamId: text("slack_team_id").primaryKey(),
  teamName: text("team_name").notNull(),
  botToken: text("bot_token").notNull(),
  installerUserId: text("installer_user_id").notNull(),
  team: integer("team_id")
    .notNull()
    .references(() => teams.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userProjects = pgTable(
  "user_projects",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.projectId] })]
);

export const googleCalendar = pgTable("google_calendar", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  channelId: text("channel_id").notNull(),
  resourceId: text("resource_id").notNull(),
  resourceUri: text("resource_uri").notNull(),
  expiration: timestamp("expiration").notNull(),
  // accessToken: text("access_token").notNull(), // new
  syncToken: text("sync_token"), // new
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(), // '7ni1ktubh5s95dc86g2rer71d3'
  kind: text("kind"), // 'calendar#event'
  etag: text("etag"), // '"3494307509621470"'
  status: text("status"), // 'confirmed'
  htmlLink: text("html_link"), // full URL
  created: timestamp("created", { withTimezone: true }), // '2025-03-27T16:10:40.000Z'
  updated: timestamp("updated", { withTimezone: true }), // '2025-05-13T16:29:14.810Z'
  summary: text("summary"), // 'Drew | Protocoding Weekly'
  iCalUID: text("ical_uid"), // '7ni1ktubh5s95dc86g2rer71d3@google.com'
  sequence: integer("sequence"), // 2
  hangoutLink: text("hangout_link"), // Google Meet link
  eventType: text("event_type"), // 'default'
  qstashMessageId: text("qstash_message_id"), // ID of the scheduled reminder in QStash

  // JSON fields
  creator: jsonb("creator"), // name, email, etc.
  organizer: jsonb("organizer"),
  start: jsonb("start"),
  end: jsonb("end"),
  recurrence: jsonb("recurrence"),
  attendees: jsonb("attendees"),
  conferenceData: jsonb("conference_data"),
  reminders: jsonb("reminders"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending, active, completed
});

export const onboarding = pgTable("onboarding", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  slug: text("slug").notNull().unique(), // for link URL
  status: text("status").notNull(), // pending, active, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export const onboardingFormQuestions = pgTable("onboarding_form_questions", {
  id: serial("id").primaryKey(),
  type: text("type").$type<"text" | "email" | "url" | "textarea">().notNull(),
  label: text("label").notNull().unique(),
  placeholder: text("placeholder"),
  required: boolean("required").notNull().default(true),
});

export const onboardingQuestions = pgTable(
  "onboarding_questions",
  {
    onboardingId: integer("onboarding_id")
      .notNull()
      .references(() => onboarding.id),
    questionId: integer("question_id")
      .notNull()
      .references(() => onboardingFormQuestions.id),
    order: integer("order").notNull(), // for step order
  },
  (table) => [primaryKey({ columns: [table.onboardingId, table.questionId] })]
);

export const onboardingFormAnswers = pgTable(
  "onboarding_form_answers",
  {
    id: serial("id").primaryKey(),
    onboardingId: integer("onboarding_id")
      .notNull()
      .references(() => onboarding.id),
    questionId: integer("question_id")
      .notNull()
      .references(() => onboardingFormQuestions.id),
    answer: text("answer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    onboardingQuestionUnique: unique().on(table.onboardingId, table.questionId),
  })
);

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dateString: timestamp("date_string").notNull(),
  duration: numeric("duration"),
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

export const importTranscripts = pgTable("import_transcripts", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(), // FK to meetings.id
  transcriptUrl: text("transcript_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(), // FK to meetings.id
  index: integer("index").notNull(),
  text: text("text").notNull(),
  startTime: numeric("start_time"),
  endTime: numeric("end_time"),
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
  meetingId: integer("meeting_id").references(() => meetings.id),
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

export const looms = pgTable("looms", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  userId: integer("user_id").references(() => users.id),
  transcript: text("transcript"),
  loomUrl: text("loom_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations

// User Relations
export const userRelations = relations(users, ({ many, one }) => ({
  taskAssignees: many(taskAssignees),
  googleCalendar: many(googleCalendar),
  looms: many(looms),
  userProjects: many(userProjects),
  slackUser: one(slackUsers, {
    fields: [users.id],
    references: [slackUsers.userId],
  }),
  userSettings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Project Relations
export const projectRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  userProjects: many(userProjects),
  clients: many(clients),
}));

export const userProjectRelations = relations(userProjects, ({ one }) => ({
  user: one(users, {
    fields: [userProjects.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [userProjects.projectId],
    references: [projects.id],
  }),
}));

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  linkedinUrl: text("linkedin_url"),
  role: text("role"),
  projectId: integer("project").references(() => projects.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Task Relations
export const taskRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  taskAssignees: many(taskAssignees),
  looms: many(looms),
  meeting: one(meetings, {
    fields: [tasks.meetingId],
    references: [meetings.id],
  }),
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
  importTranscripts: one(importTranscripts),
  tasks: many(tasks),
}));

export const importTranscriptRelations = relations(
  importTranscripts,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [importTranscripts.meetingId],
      references: [meetings.id],
    }),
  })
);

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

// Add relations to the onboarding and onboardingFormQuestions tables
export const onboardingAnswerRelations = relations(
  onboardingFormAnswers,
  ({ one }) => ({
    onboarding: one(onboarding, {
      fields: [onboardingFormAnswers.onboardingId],
      references: [onboarding.id],
    }),
    question: one(onboardingFormQuestions, {
      fields: [onboardingFormAnswers.questionId],
      references: [onboardingFormQuestions.id],
    }),
  })
);

// Update onboarding relation to include answers
// Onboarding Relations
export const onboardingRelations = relations(onboarding, ({ one, many }) => ({
  project: one(projects, {
    fields: [onboarding.projectId],
    references: [projects.id],
  }),
  questions: many(onboardingQuestions), // New relation
  answers: many(onboardingFormAnswers),
}));

// Update onboardingFormQuestions relation to include answers
export const onboardingQuestionRelations = relations(
  onboardingFormQuestions,
  ({ many }) => ({
    answers: many(onboardingFormAnswers),
  })
);

// Onboarding Questions (Join Table) Relations
export const onboardingQuestionsRelations = relations(
  onboardingQuestions,
  ({ one }) => ({
    onboarding: one(onboarding, {
      fields: [onboardingQuestions.onboardingId],
      references: [onboarding.id],
    }),
    question: one(onboardingFormQuestions, {
      fields: [onboardingQuestions.questionId],
      references: [onboardingFormQuestions.id],
    }),
  })
);

// Looms Relations
export const loomRelations = relations(looms, ({ one }) => ({
  task: one(tasks, {
    fields: [looms.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [looms.userId],
    references: [users.id],
  }),
}));

export const googleCalendarRelations = relations(googleCalendar, ({ one }) => ({
  user: one(users, {
    fields: [googleCalendar.userId],
    references: [users.id],
  }),
}));

export const slackUserRelations = relations(slackUsers, ({ one }) => ({
  slackInstallation: one(slackInstallations, {
    fields: [slackUsers.slackTeamId],
    references: [slackInstallations.slackTeamId],
  }),
  user: one(users, {
    fields: [slackUsers.userId],
    references: [users.id],
  }),
}));

// Client Relations: A client belongs to one company
export const clientRelations = relations(clients, ({ one }) => ({
  project: one(projects, {
    fields: [clients.projectId],
    references: [projects.id],
  }),
}));

