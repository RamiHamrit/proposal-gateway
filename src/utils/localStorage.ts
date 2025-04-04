
/**
 * Utility functions for handling localStorage operations
 */

// Initial teacher data
export const initialTeachers = [
  {
    id: 'teacher-1',
    name: 'أحمد مالكي',
    username: 'Ahmed',
    role: 'teacher' as const,
    projects: [],
  },
  {
    id: 'teacher-2',
    name: 'فؤاد حمداوي',
    username: 'Fouad',
    role: 'teacher' as const,
    projects: [],
  },
];

// Initial teacher passwords
export const teacherPasswords = {
  'Ahmed': 'Ahmed1234',
  'Fouad': 'Fouad1234',
};

// Helper to get data from localStorage
export const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Helper to save data to localStorage
export const saveLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper to clear auth-related localStorage items
export const clearAuthData = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('sb-woxcxuhcrhyoeynmuhtw-auth-token');
};

// Initialize the local storage with required data
export const initializeData = (): void => {
  console.log('Initializing local storage data');
  
  // Force initialize teachers - always ensure they exist
  console.log('Initializing teachers data');
  saveLocalData('teachers', initialTeachers);
  
  // Force initialize teacher passwords - always ensure they exist
  console.log('Initializing teacher passwords');
  saveLocalData('teacherPasswords', teacherPasswords);
  
  // Initialize empty arrays for other data if not present
  if (!localStorage.getItem('projects')) {
    saveLocalData('projects', []);
  }
  
  if (!localStorage.getItem('proposals')) {
    saveLocalData('proposals', []);
  }
  
  if (!localStorage.getItem('students')) {
    saveLocalData('students', []);
  }
  
  // Log what's been initialized to verify
  console.log('Teachers initialized:', getLocalData('teachers', []));
  console.log('Teacher passwords initialized:', getLocalData('teacherPasswords', {}));
};
