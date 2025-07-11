import { db } from "../server/db";
import { users, branches, subjects, units, questions } from "../shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Create branches
    const branchesData = [
      { name: "Computer Science", code: "CS" },
      { name: "Mechanical Engineering", code: "ME" },
      { name: "Electrical Engineering", code: "EE" },
      { name: "Civil Engineering", code: "CE" }
    ];

    const createdBranches = await db.insert(branches).values(branchesData).returning();
    console.log("✓ Branches created");

    // Create users with hashed passwords
    const usersData = [
      {
        name: "Admin User",
        email: "admin@institute.edu",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        branchId: createdBranches[0].id
      },
      {
        name: "CS HOD",
        email: "hod.cs@institute.edu",
        password: await bcrypt.hash("hod123", 10),
        role: "hod",
        branchId: createdBranches[0].id
      },
      {
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@institute.edu",
        password: await bcrypt.hash("teacher123", 10),
        role: "teacher",
        branchId: createdBranches[0].id
      },
      {
        name: "Prof. Priya Sharma",
        email: "priya.sharma@institute.edu",
        password: await bcrypt.hash("teacher123", 10),
        role: "teacher",
        branchId: createdBranches[0].id
      },
      {
        name: "Amit Patel",
        email: "amit.patel@student.edu",
        password: await bcrypt.hash("student123", 10),
        role: "student",
        branchId: createdBranches[0].id
      },
      {
        name: "Sneha Gupta",
        email: "sneha.gupta@student.edu",
        password: await bcrypt.hash("student123", 10),
        role: "student",
        branchId: createdBranches[0].id
      },
      {
        name: "Rohit Singh",
        email: "rohit.singh@student.edu",
        password: await bcrypt.hash("student123", 10),
        role: "student",
        branchId: createdBranches[0].id
      }
    ];

    const createdUsers = await db.insert(users).values(usersData).returning();
    console.log("✓ Users created");

    // Create subjects
    const subjectsData = [
      {
        name: "Data Structures and Algorithms",
        code: "CS101",
        branchId: createdBranches[0].id,
        teacherEmail: "rajesh.kumar@institute.edu"
      },
      {
        name: "Database Management Systems",
        code: "CS102",
        branchId: createdBranches[0].id,
        teacherEmail: "priya.sharma@institute.edu"
      },
      {
        name: "Operating Systems",
        code: "CS103",
        branchId: createdBranches[0].id,
        teacherEmail: "rajesh.kumar@institute.edu"
      },
      {
        name: "Computer Networks",
        code: "CS104",
        branchId: createdBranches[0].id,
        teacherEmail: "priya.sharma@institute.edu"
      }
    ];

    const createdSubjects = await db.insert(subjects).values(subjectsData).returning();
    console.log("✓ Subjects created");

    // Create units for each subject
    const unitsData = [];
    for (const subject of createdSubjects) {
      const subjectUnits = [
        {
          unitNo: 1,
          title: `${subject.name} - Unit 1`,
          summary: `Introduction to ${subject.name}`,
          subjectId: subject.id
        },
        {
          unitNo: 2,
          title: `${subject.name} - Unit 2`,
          summary: `Core concepts of ${subject.name}`,
          subjectId: subject.id
        },
        {
          unitNo: 3,
          title: `${subject.name} - Unit 3`,
          summary: `Advanced topics in ${subject.name}`,
          subjectId: subject.id
        },
        {
          unitNo: 4,
          title: `${subject.name} - Unit 4`,
          summary: `Practical applications of ${subject.name}`,
          subjectId: subject.id
        }
      ];
      unitsData.push(...subjectUnits);
    }

    const createdUnits = await db.insert(units).values(unitsData).returning();
    console.log("✓ Units created");

    // Create sample questions for some units
    const questionsData = [];
    for (let i = 0; i < Math.min(8, createdUnits.length); i++) {
      const unit = createdUnits[i];
      const unitQuestions = [
        {
          unitId: unit.id,
          question: `What is the main concept covered in ${unit.title}?`,
          type: "mcq" as const,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A"
        },
        {
          unitId: unit.id,
          question: `Explain the importance of ${unit.title} in practical applications.`,
          type: "short_answer" as const,
          options: [],
          correctAnswer: "This unit covers fundamental concepts that are essential for understanding advanced topics."
        },
        {
          unitId: unit.id,
          question: `Which of the following best describes ${unit.title}?`,
          type: "mcq" as const,
          options: ["Basic concept", "Advanced topic", "Practical application", "Theoretical framework"],
          correctAnswer: "Basic concept"
        }
      ];
      questionsData.push(...unitQuestions);
    }

    await db.insert(questions).values(questionsData);
    console.log("✓ Sample questions created");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\nLogin Credentials:");
    console.log("==================");
    console.log("Admin: admin@institute.edu / admin123");
    console.log("HOD: hod.cs@institute.edu / hod123");
    console.log("Teacher: rajesh.kumar@institute.edu / teacher123");
    console.log("Teacher: priya.sharma@institute.edu / teacher123");
    console.log("Student: amit.patel@student.edu / student123");
    console.log("Student: sneha.gupta@student.edu / student123");
    console.log("Student: rohit.singh@student.edu / student123");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();