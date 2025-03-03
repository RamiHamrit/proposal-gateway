
export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: 'student' | 'teacher';
}

export interface Student extends User {
  role: 'student';
  email: string;
  proposals: Proposal[];
}

export interface Teacher extends User {
  role: 'teacher';
  username: string;
  projects: Project[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  proposals: Proposal[];
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  status: 'pending' | 'approved' | 'rejected' | 'selected';
  createdAt: string;
}

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';
