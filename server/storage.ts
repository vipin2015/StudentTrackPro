import { 
  users, 
  branches, 
  subjects, 
  units, 
  attendance, 
  progress, 
  questions,
  type User, 
  type InsertUser,
  type Branch,
  type InsertBranch,
  type Subject,
  type InsertSubject,
  type Unit,
  type InsertUnit,
  type Attendance,
  type InsertAttendance,
  type Progress,
  type InsertProgress,
  type Question,
  type InsertQuestion
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByBranch(branchId: number): Promise<User[]>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  
  // Branches
  getBranches(): Promise<Branch[]>;
  createBranch(insertBranch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, data: Partial<InsertBranch>): Promise<Branch>;
  
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubjectsByBranch(branchId: number): Promise<Subject[]>;
  getSubjectsByTeacher(teacherEmail: string): Promise<Subject[]>;
  createSubject(insertSubject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, data: Partial<InsertSubject>): Promise<Subject>;
  
  // Units
  getUnitsBySubject(subjectId: number): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  createUnit(insertUnit: InsertUnit): Promise<Unit>;
  updateUnit(id: number, data: Partial<InsertUnit>): Promise<Unit>;
  
  // Attendance
  getAttendance(date: string, subjectId: number): Promise<Attendance[]>;
  getStudentAttendance(studentEmail: string, subjectId?: number): Promise<Attendance[]>;
  createAttendance(insertAttendance: InsertAttendance): Promise<Attendance>;
  
  // Progress
  getProgress(studentEmail: string, subjectId?: number): Promise<Progress[]>;
  getProgressByUnit(unitId: number): Promise<Progress[]>;
  createProgress(insertProgress: InsertProgress): Promise<Progress>;
  updateProgress(id: number, data: Partial<InsertProgress>): Promise<Progress>;
  
  // Questions
  getQuestionsByUnit(unitId: number): Promise<Question[]>;
  createQuestion(insertQuestion: InsertQuestion): Promise<Question>;
  
  // Analytics
  getBranchStats(): Promise<any[]>;
  getAttendanceStats(branchId?: number): Promise<any[]>;
  getProgressStats(branchId?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getUsersByBranch(branchId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.branchId, branchId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches);
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const [branch] = await db
      .insert(branches)
      .values(insertBranch)
      .returning();
    return branch;
  }

  async updateBranch(id: number, data: Partial<InsertBranch>): Promise<Branch> {
    const [branch] = await db
      .update(branches)
      .set(data)
      .where(eq(branches.id, id))
      .returning();
    return branch;
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async getSubjectsByBranch(branchId: number): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.branchId, branchId));
  }

  async getSubjectsByTeacher(teacherEmail: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.teacherEmail, teacherEmail));
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db
      .insert(subjects)
      .values(insertSubject)
      .returning();
    return subject;
  }

  async updateSubject(id: number, data: Partial<InsertSubject>): Promise<Subject> {
    const [subject] = await db
      .update(subjects)
      .set(data)
      .where(eq(subjects.id, id))
      .returning();
    return subject;
  }

  // Units
  async getUnitsBySubject(subjectId: number): Promise<Unit[]> {
    return await db.select().from(units).where(eq(units.subjectId, subjectId));
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    const [unit] = await db.select().from(units).where(eq(units.id, id));
    return unit || undefined;
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const [unit] = await db
      .insert(units)
      .values(insertUnit)
      .returning();
    return unit;
  }

  async updateUnit(id: number, data: Partial<InsertUnit>): Promise<Unit> {
    const [unit] = await db
      .update(units)
      .set(data)
      .where(eq(units.id, id))
      .returning();
    return unit;
  }

  // Attendance
  async getAttendance(date: string, subjectId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(
      and(
        eq(attendance.date, new Date(date)),
        eq(attendance.subjectId, subjectId)
      )
    );
  }

  async getStudentAttendance(studentEmail: string, subjectId?: number): Promise<Attendance[]> {
    if (subjectId) {
      return await db.select().from(attendance).where(
        and(
          eq(attendance.studentEmail, studentEmail),
          eq(attendance.subjectId, subjectId)
        )
      );
    }
    return await db.select().from(attendance).where(eq(attendance.studentEmail, studentEmail));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [record] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return record;
  }

  // Progress
  async getProgress(studentEmail: string, subjectId?: number): Promise<Progress[]> {
    if (subjectId) {
      return await db.select().from(progress).where(
        and(
          eq(progress.studentEmail, studentEmail),
          eq(progress.subjectId, subjectId)
        )
      );
    }
    return await db.select().from(progress).where(eq(progress.studentEmail, studentEmail));
  }

  async getProgressByUnit(unitId: number): Promise<Progress[]> {
    return await db.select().from(progress).where(eq(progress.unitId, unitId));
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const [record] = await db
      .insert(progress)
      .values(insertProgress)
      .returning();
    return record;
  }

  async updateProgress(id: number, data: Partial<InsertProgress>): Promise<Progress> {
    const [record] = await db
      .update(progress)
      .set(data)
      .where(eq(progress.id, id))
      .returning();
    return record;
  }

  // Questions
  async getQuestionsByUnit(unitId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.unitId, unitId));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  // Analytics (simplified implementations)
  async getBranchStats(): Promise<any[]> {
    // This would need complex joins in a real implementation
    const branchList = await this.getBranches();
    const stats = [];
    
    for (const branch of branchList) {
      const students = await this.getUsersByBranch(branch.id);
      const allUsers = await this.getUsersByRole('teacher');
      const teachers = allUsers.filter(u => u.branchId === branch.id);
      const subjectList = await this.getSubjectsByBranch(branch.id);
      
      stats.push({
        branchId: branch.id,
        branchName: branch.name,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalSubjects: subjectList.length,
      });
    }
    
    return stats;
  }

  async getAttendanceStats(branchId?: number): Promise<any[]> {
    // Simplified implementation - would need complex queries in real app
    const subjectList = branchId 
      ? await this.getSubjectsByBranch(branchId)
      : await this.getSubjects();
    
    const stats = [];
    for (const subject of subjectList) {
      // This is a simplified calculation
      stats.push({
        subjectId: subject.id,
        subjectName: subject.name,
        attendanceRate: 75 + Math.random() * 20, // Mock data for demo
        totalPresent: Math.floor(Math.random() * 100),
        totalAbsent: Math.floor(Math.random() * 20),
      });
    }
    
    return stats;
  }

  async getProgressStats(branchId?: number): Promise<any[]> {
    // Simplified implementation
    const subjectList = branchId 
      ? await this.getSubjectsByBranch(branchId)
      : await this.getSubjects();
    
    const stats = [];
    for (const subject of subjectList) {
      stats.push({
        subjectId: subject.id,
        subjectName: subject.name,
        avgTeacherCoverage: 60 + Math.random() * 30,
        avgStudentCoverage: 50 + Math.random() * 40,
        completedUnits: Math.floor(Math.random() * 10),
        totalUnits: 10 + Math.floor(Math.random() * 5),
      });
    }
    
    return stats;
  }
}

export const storage = new DatabaseStorage();