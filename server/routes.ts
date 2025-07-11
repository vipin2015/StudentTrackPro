import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBranchSchema, insertSubjectSchema, insertUnitSchema, insertAttendanceSchema, insertProgressSchema, insertQuestionSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const attendanceArraySchema = z.array(insertAttendanceSchema);
const progressUpdateSchema = z.object({
  studentEmail: z.string().email(),
  subjectId: z.number(),
  unitId: z.number(),
  studentCoverage: z.number().min(0).max(100),
});

const quizSubmissionSchema = z.object({
  unitId: z.number(),
  studentEmail: z.string().email(),
  answers: z.array(z.object({
    questionId: z.number(),
    answer: z.string(),
  })),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd create a JWT token here
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const { role, branchId } = req.query;
      let users;
      
      if (role) {
        users = await storage.getUsersByRole(role as string);
      } else if (branchId) {
        users = await storage.getUsersByBranch(parseInt(branchId as string));
      } else {
        users = await storage.getUsersByRole("student"); // Default to students
      }
      
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const user = await storage.updateUser(id, userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  // Branches
  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.post("/api/branches", async (req, res) => {
    try {
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(branchData);
      res.json(branch);
    } catch (error) {
      res.status(400).json({ message: "Failed to create branch" });
    }
  });

  app.put("/api/branches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const branchData = insertBranchSchema.partial().parse(req.body);
      const branch = await storage.updateBranch(id, branchData);
      res.json(branch);
    } catch (error) {
      res.status(400).json({ message: "Failed to update branch" });
    }
  });

  // Subjects
  app.get("/api/subjects", async (req, res) => {
    try {
      const { branchId, teacherEmail } = req.query;
      let subjects;
      
      if (branchId) {
        subjects = await storage.getSubjectsByBranch(parseInt(branchId as string));
      } else if (teacherEmail) {
        subjects = await storage.getSubjectsByTeacher(teacherEmail as string);
      } else {
        subjects = await storage.getSubjects();
      }
      
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      res.status(400).json({ message: "Failed to create subject" });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subjectData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, subjectData);
      res.json(subject);
    } catch (error) {
      res.status(400).json({ message: "Failed to update subject" });
    }
  });

  // Units
  app.get("/api/units", async (req, res) => {
    try {
      const { subjectId } = req.query;
      if (!subjectId) {
        return res.status(400).json({ message: "Subject ID is required" });
      }
      
      const units = await storage.getUnitsBySubject(parseInt(subjectId as string));
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const unitData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(unitData);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: "Failed to create unit" });
    }
  });

  app.put("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const unitData = insertUnitSchema.partial().parse(req.body);
      const unit = await storage.updateUnit(id, unitData);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ message: "Failed to update unit" });
    }
  });

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    try {
      const { date, subjectId, studentEmail } = req.query;
      
      if (date && subjectId) {
        const attendance = await storage.getAttendance(date as string, parseInt(subjectId as string));
        res.json(attendance);
      } else if (studentEmail) {
        const attendance = await storage.getStudentAttendance(
          studentEmail as string,
          subjectId ? parseInt(subjectId as string) : undefined
        );
        res.json(attendance);
      } else {
        res.status(400).json({ message: "Date and subject ID, or student email is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = attendanceArraySchema.parse(req.body);
      const results = [];
      
      for (const record of attendanceData) {
        const attendance = await storage.createAttendance(record);
        results.push(attendance);
      }
      
      res.json(results);
    } catch (error) {
      res.status(400).json({ message: "Failed to create attendance records" });
    }
  });

  // Progress
  app.get("/api/progress", async (req, res) => {
    try {
      const { studentEmail, subjectId, unitId } = req.query;
      
      if (unitId) {
        const progress = await storage.getProgressByUnit(parseInt(unitId as string));
        res.json(progress);
      } else if (studentEmail) {
        const progress = await storage.getProgress(
          studentEmail as string,
          subjectId ? parseInt(subjectId as string) : undefined
        );
        res.json(progress);
      } else {
        res.status(400).json({ message: "Student email or unit ID is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse(req.body);
      const progress = await storage.createProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Failed to create progress record" });
    }
  });

  app.put("/api/progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const progressData = insertProgressSchema.partial().parse(req.body);
      const progress = await storage.updateProgress(id, progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Failed to update progress" });
    }
  });

  app.put("/api/progress/student", async (req, res) => {
    try {
      const updateData = progressUpdateSchema.parse(req.body);
      const existingProgress = await storage.getProgress(updateData.studentEmail, updateData.subjectId);
      
      const progressRecord = existingProgress.find(p => p.unitId === updateData.unitId);
      
      if (progressRecord) {
        const updated = await storage.updateProgress(progressRecord.id, {
          studentCoverage: updateData.studentCoverage,
        });
        res.json(updated);
      } else {
        const created = await storage.createProgress({
          studentEmail: updateData.studentEmail,
          subjectId: updateData.subjectId,
          unitId: updateData.unitId,
          studentCoverage: updateData.studentCoverage,
        });
        res.json(created);
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to update student progress" });
    }
  });

  // Questions
  app.get("/api/questions", async (req, res) => {
    try {
      const { unitId } = req.query;
      if (!unitId) {
        return res.status(400).json({ message: "Unit ID is required" });
      }
      
      const questions = await storage.getQuestionsByUnit(parseInt(unitId as string));
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: "Failed to create question" });
    }
  });

  // Quiz submission
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const { unitId, studentEmail, answers } = quizSubmissionSchema.parse(req.body);
      
      // Get questions for the unit
      const questions = await storage.getQuestionsByUnit(unitId);
      
      // Calculate score
      let correctAnswers = 0;
      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.answer) {
          correctAnswers++;
        }
      }
      
      const score = (correctAnswers / questions.length) * 100;
      const completed = score >= 80;
      
      // Update progress
      const existingProgress = await storage.getProgress(studentEmail);
      const progressRecord = existingProgress.find(p => p.unitId === unitId);
      
      if (progressRecord) {
        const updated = await storage.updateProgress(progressRecord.id, {
          quizScore: score,
          completed,
        });
        res.json({ score, completed, progress: updated });
      } else {
        // Find subject ID for the unit
        const unit = await storage.getUnit(unitId);
        if (!unit) {
          return res.status(404).json({ message: "Unit not found" });
        }
        
        const created = await storage.createProgress({
          studentEmail,
          subjectId: unit.subjectId,
          unitId,
          quizScore: score,
          completed,
        });
        res.json({ score, completed, progress: created });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to submit quiz" });
    }
  });

  // Analytics
  app.get("/api/analytics/branches", async (req, res) => {
    try {
      const stats = await storage.getBranchStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch branch statistics" });
    }
  });

  app.get("/api/analytics/attendance", async (req, res) => {
    try {
      const { branchId } = req.query;
      const stats = await storage.getAttendanceStats(
        branchId ? parseInt(branchId as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance statistics" });
    }
  });

  app.get("/api/analytics/progress", async (req, res) => {
    try {
      const { branchId } = req.query;
      const stats = await storage.getProgressStats(
        branchId ? parseInt(branchId as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
