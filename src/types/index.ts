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
  name: string;           // matches 'name' in Supabase
  description: string;
  created_by: string;     // matches 'created_by' in Supabase
  teacher_name?: string;  // optional, if you added this column
  created_at: string;
}

export interface Proposal {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'selected';
  student_name?: string;
}

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';
