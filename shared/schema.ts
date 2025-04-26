import { pgTable, text, serial, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Study Plans table
export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  topics: jsonb("topics").notNull(),
  examDate: text("exam_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).pick({
  userId: true,
  subject: true,
  topics: true,
  examDate: true,
});

export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;
export type StudyPlan = typeof studyPlans.$inferSelect;

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  detailLevel: text("detail_level").notNull(),
  format: text("format").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  topic: true,
  detailLevel: true,
  format: true,
  content: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Explanations table
export const explanations = pgTable("explanations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExplanationSchema = createInsertSchema(explanations).pick({
  userId: true,
  topic: true,
  content: true,
});

export type InsertExplanation = z.infer<typeof insertExplanationSchema>;
export type Explanation = typeof explanations.$inferSelect;

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  questions: jsonb("questions").notNull(),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  userId: true,
  topic: true,
  difficulty: true,
  questions: true,
  score: true,
});

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

// Progress tracking table
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  quizScores: jsonb("quiz_scores").notNull(),
  completion: integer("completion").notNull(),
  lastStudied: timestamp("last_studied").defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progress).pick({
  userId: true,
  topic: true,
  quizScores: true,
  completion: true,
});

export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;

// Topic Status tracking
export const topicStatus = pgTable("topic_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  studyPlanId: integer("study_plan_id").references(() => studyPlans.id),
  topicIndex: integer("topic_index").notNull(),
  completed: boolean("completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTopicStatusSchema = createInsertSchema(topicStatus).pick({
  userId: true,
  studyPlanId: true,
  topicIndex: true,
  completed: true,
});

export type InsertTopicStatus = z.infer<typeof insertTopicStatusSchema>;
export type TopicStatus = typeof topicStatus.$inferSelect;
