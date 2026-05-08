import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Calendar,
  PlusCircle,
  Library,
  UsersRound,
  GraduationCap,
  Database,
  Sparkles,
} from "lucide-react";

export const ROUTES_CONFIG = {
  STUDENT: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/student" },
    { icon: GraduationCap, label: "Exams", href: "/student/exams" },
    { icon: PlusCircle, label: "My Quizzes", href: "/student/myquizzes" },
    { icon: Database, label: "Question Bank", href: "/student/question-bank" },
    { icon: UsersRound, label: "Study Groups", href: "/student/study-group" },
    { icon: Library, label: "Library", href: "/student/library" },
  ],

  TEACHER: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/teacher" },
    { icon: BookOpen, label: "Quizzes", href: "/teacher/quizzes" },
    { icon: Database, label: "Question Bank", href: "/teacher/question-bank" },
    { icon: Calendar, label: "Events", href: "/teacher/events" },
    { icon: Users, label: "Students", href: "/teacher/students" },
  ],

  ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Accounts", href: "/admin/accounts" },
    { icon: BookOpen, label: "Quizzes", href: "/admin/quizmanage" },
    { icon: FileText, label: "Reports", href: "/admin/reports" },
    { icon: Sparkles, label: "AI Config", href: "/admin/ai-config" },
  ],
};

export type UserRole = keyof typeof ROUTES_CONFIG;
