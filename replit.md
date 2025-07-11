# EduTrack - Institute Management System

## Overview

EduTrack is a comprehensive multi-role educational management system designed for diploma engineering institutes. The application enables tracking of student attendance, subject-wise syllabus coverage, unit-level performance through quizzes, and provides comparative analytics between teacher and student progress. The system supports bilingual interface (English/Hindi) and serves four distinct user roles: Head of Institute (Admin), Head of Department (HOD), Teachers, and Students.

## User Preferences

Preferred communication style: Simple, everyday language.
User Interest: Mobile deployment options for the web application.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API for auth and language state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based with bcrypt for password hashing
- **Session Storage**: PostgreSQL with connect-pg-simple

## Key Components

### User Management System
- **Multi-role Authentication**: Admin, HOD, Teacher, Student roles
- **Role-based Access Control**: Different UI and API permissions per role
- **Session Management**: Secure session handling with database storage

### Educational Structure
- **Hierarchical Organization**: Institute → Branches → Subjects → Units
- **Teacher Assignment**: Teachers can be assigned to specific subjects
- **Student Enrollment**: Students belong to branches and access assigned subjects

### Attendance Tracking
- **Teacher Interface**: Mark attendance for assigned subjects
- **Date-based Recording**: Track daily attendance per subject
- **Student View**: View personal attendance records

### Progress Tracking
- **Dual Progress Bars**: Teacher coverage (light) vs Student coverage (dark)
- **Unit-level Granularity**: Track progress per unit within subjects
- **Real-time Updates**: Teachers and students can update coverage independently

### Assessment System
- **Unit-based Quizzes**: MCQ and short answer questions per unit
- **Teacher Question Management**: Teachers can add/edit questions
- **Student Assessment**: Take quizzes after reviewing unit summaries

### Analytics Dashboard
- **Role-specific Views**: Different analytics based on user role
- **Performance Metrics**: Attendance rates, progress tracking, quiz results
- **Comparative Analysis**: Teacher vs student progress comparison

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Server validates against database using bcrypt
3. Session created and stored in PostgreSQL
4. Client receives user object and role information
5. Frontend routes and UI adapt based on user role

### Attendance Flow
1. Teacher selects subject and date
2. System fetches enrolled students for that subject
3. Teacher marks present/absent for each student
4. Data stored in attendance table with timestamps
5. Students can view their attendance records

### Progress Tracking Flow
1. Teacher updates syllabus coverage for units
2. Students independently track their personal progress
3. Progress stored separately for teacher and student
4. Frontend displays comparative progress bars
5. Analytics aggregated across branches and subjects

### Assessment Flow
1. Teacher creates questions for specific units
2. Students read unit summaries before taking quiz
3. Quiz responses stored and evaluated
4. Results contribute to overall progress metrics

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: Managed through @neondatabase/serverless

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization for analytics

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with HMR
- **Database**: Neon development database
- **Environment**: NODE_ENV=development

### Production Build
- **Frontend**: Vite build to dist/public
- **Backend**: ESBuild compilation to dist/
- **Entry Point**: Node.js running dist/index.js

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)

### Database Schema
- **Migration Strategy**: Drizzle migrations in ./migrations
- **Schema Definition**: Centralized in ./shared/schema.ts
- **Type Safety**: Full TypeScript integration with Drizzle

The application follows a monorepo structure with shared types and schemas, enabling type safety across frontend and backend. The build process separates client and server bundling while maintaining shared dependencies for consistent data types and validation schemas.