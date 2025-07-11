import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'english' | 'hindi';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  english: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.add': 'Add',
    'common.update': 'Update',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.branches': 'Branches',
    'nav.users': 'Users',
    'nav.subjects': 'Subjects',
    'nav.attendance': 'Attendance',
    'nav.progress': 'Progress',
    'nav.analytics': 'Analytics',
    
    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.invalid_credentials': 'Invalid credentials',
    
    // Roles
    'role.admin': 'Head of Institute',
    'role.hod': 'Head of Department',
    'role.teacher': 'Teacher',
    'role.student': 'Student',
    
    // Dashboard
    'dashboard.title': 'Institute Dashboard',
    'dashboard.total_students': 'Total Students',
    'dashboard.total_teachers': 'Total Teachers',
    'dashboard.total_branches': 'Branches',
    'dashboard.avg_attendance': 'Avg. Attendance',
    'dashboard.recent_activities': 'Recent Activities',
    'dashboard.branch_performance': 'Branch Performance',
    
    // Attendance
    'attendance.mark_attendance': 'Mark Attendance',
    'attendance.date': 'Date',
    'attendance.subject': 'Subject',
    'attendance.student_list': 'Student List',
    'attendance.present': 'Present',
    'attendance.absent': 'Absent',
    'attendance.save_attendance': 'Save Attendance',
    
    // Progress
    'progress.teacher_coverage': 'Teacher Coverage',
    'progress.student_coverage': 'Student Coverage',
    'progress.my_progress': 'My Progress',
    'progress.unit_progress': 'Unit Progress',
    'progress.completed': 'Completed',
    'progress.in_progress': 'In Progress',
    'progress.not_started': 'Not Started',
    
    // Quiz
    'quiz.title': 'Unit Quiz',
    'quiz.summary': 'Unit Summary',
    'quiz.take_quiz': 'Take Quiz',
    'quiz.submit_quiz': 'Submit Quiz',
    'quiz.score': 'Score',
    'quiz.passed': 'Passed',
    'quiz.failed': 'Failed',
    'quiz.unit_completed': 'Unit Completed',
    
    // Subjects
    'subjects.add_subject': 'Add Subject',
    'subjects.subject_name': 'Subject Name',
    'subjects.teacher_assigned': 'Teacher Assigned',
    'subjects.branch': 'Branch',
    'subjects.units': 'Units',
    'subjects.add_unit': 'Add Unit',
    'subjects.unit_title': 'Unit Title',
    'subjects.unit_summary': 'Unit Summary',
    
    // Users
    'users.add_user': 'Add User',
    'users.name': 'Name',
    'users.email': 'Email',
    'users.role': 'Role',
    'users.branch': 'Branch',
    'users.created': 'Created',
    
    // Branches
    'branches.add_branch': 'Add Branch',
    'branches.branch_name': 'Branch Name',
    'branches.hod_email': 'HOD Email',
    'branches.total_students': 'Total Students',
    'branches.total_teachers': 'Total Teachers',
    'branches.performance': 'Performance',
  },
  hindi: {
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.view': 'देखें',
    'common.add': 'जोड़ें',
    'common.update': 'अपडेट करें',
    'common.submit': 'जमा करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.branches': 'शाखाएं',
    'nav.users': 'उपयोगकर्ता',
    'nav.subjects': 'विषय',
    'nav.attendance': 'उपस्थिति',
    'nav.progress': 'प्रगति',
    'nav.analytics': 'विश्लेषण',
    
    // Authentication
    'auth.login': 'लॉगिन',
    'auth.logout': 'लॉगआउट',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.invalid_credentials': 'गलत प्रमाण पत्र',
    
    // Roles
    'role.admin': 'संस्थान प्रमुख',
    'role.hod': 'विभाग प्रमुख',
    'role.teacher': 'शिक्षक',
    'role.student': 'छात्र',
    
    // Dashboard
    'dashboard.title': 'संस्थान डैशबोर्ड',
    'dashboard.total_students': 'कुल छात्र',
    'dashboard.total_teachers': 'कुल शिक्षक',
    'dashboard.total_branches': 'शाखाएं',
    'dashboard.avg_attendance': 'औसत उपस्थिति',
    'dashboard.recent_activities': 'हाल की गतिविधियां',
    'dashboard.branch_performance': 'शाखा प्रदर्शन',
    
    // Attendance
    'attendance.mark_attendance': 'उपस्थिति चिह्नित करें',
    'attendance.date': 'तारीख',
    'attendance.subject': 'विषय',
    'attendance.student_list': 'छात्र सूची',
    'attendance.present': 'उपस्थित',
    'attendance.absent': 'अनुपस्थित',
    'attendance.save_attendance': 'उपस्थिति सेव करें',
    
    // Progress
    'progress.teacher_coverage': 'शिक्षक कवरेज',
    'progress.student_coverage': 'छात्र कवरेज',
    'progress.my_progress': 'मेरी प्रगति',
    'progress.unit_progress': 'यूनिट प्रगति',
    'progress.completed': 'पूर्ण',
    'progress.in_progress': 'प्रगति में',
    'progress.not_started': 'शुरू नहीं',
    
    // Quiz
    'quiz.title': 'यूनिट क्विज',
    'quiz.summary': 'यूनिट सारांश',
    'quiz.take_quiz': 'क्विज लें',
    'quiz.submit_quiz': 'क्विज जमा करें',
    'quiz.score': 'अंक',
    'quiz.passed': 'पास',
    'quiz.failed': 'फेल',
    'quiz.unit_completed': 'यूनिट पूर्ण',
    
    // Subjects
    'subjects.add_subject': 'विषय जोड़ें',
    'subjects.subject_name': 'विषय का नाम',
    'subjects.teacher_assigned': 'शिक्षक नियुक्त',
    'subjects.branch': 'शाखा',
    'subjects.units': 'यूनिट्स',
    'subjects.add_unit': 'यूनिट जोड़ें',
    'subjects.unit_title': 'यूनिट शीर्षक',
    'subjects.unit_summary': 'यूनिट सारांश',
    
    // Users
    'users.add_user': 'उपयोगकर्ता जोड़ें',
    'users.name': 'नाम',
    'users.email': 'ईमेल',
    'users.role': 'भूमिका',
    'users.branch': 'शाखा',
    'users.created': 'बनाया गया',
    
    // Branches
    'branches.add_branch': 'शाखा जोड़ें',
    'branches.branch_name': 'शाखा का नाम',
    'branches.hod_email': 'HOD ईमेल',
    'branches.total_students': 'कुल छात्र',
    'branches.total_teachers': 'कुल शिक्षक',
    'branches.performance': 'प्रदर्शन',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'english' | 'hindi';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'english' ? 'hindi' : 'english';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['english']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
