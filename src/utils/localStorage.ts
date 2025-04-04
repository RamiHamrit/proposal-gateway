
/**
 * Utility functions for handling localStorage operations
 */

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

// Initialize the local storage with dummy data if needed
export const initializeData = (): void => {
  // Import needed only in this function
  import('@/context/AuthContext').then(({ initialTeachers }) => {
    // Initialize teachers if not present
    const teachers = getLocalData<any[]>('teachers', []);
    if (teachers.length === 0) {
      saveLocalData('teachers', initialTeachers);
    }
    
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
  });
};
