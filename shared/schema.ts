import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // admin, hod, teacher, student
  branchId: integer("branch_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hodEmail: text("hod_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  branchId: integer("branch_id").notNull(),
  teacherEmail: text("teacher_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  unitNo: integer("unit_no").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  studentEmail: text("student_email").notNull(),
  subjectId: integer("subject_id").notNull(),
  present: boolean("present").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  studentEmail: text("student_email").notNull(),
  subjectId: integer("subject_id").notNull(),
  unitId: integer("unit_id").notNull(),
  teacherCoverage: real("teacher_coverage").default(0),
  studentCoverage: real("student_coverage").default(0),
  quizScore: real("quiz_score"),
  completed: boolean("completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull(),
  question: text("question").notNull(),
  options: text("options").array(),
  correctAnswer: text("correct_answer").notNull(),
  type: text("type").notNull(), // mcq, short_answer
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  attendanceRecords: many(attendance),
  progressRecords: many(progress),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  branch: one(branches, {
    fields: [subjects.branchId],
    references: [branches.id],
  }),
  units: many(units),
  attendanceRecords: many(attendance),
  progressRecords: many(progress),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [units.subjectId],
    references: [subjects.id],
  }),
  progressRecords: many(progress),
  questions: many(questions),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  subject: one(subjects, {
    fields: [attendance.subjectId],
    references: [subjects.id],
  }),
  student: one(users, {
    fields: [attendance.studentEmail],
    references: [users.email],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  subject: one(subjects, {
    fields: [progress.subjectId],
    references: [subjects.id],
  }),
  unit: one(units, {
    fields: [progress.unitId],
    references: [units.id],
  }),
  student: one(users, {
    fields: [progress.studentEmail],
    references: [users.email],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  unit: one(units, {
    fields: [questions.unitId],
    references: [units.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
