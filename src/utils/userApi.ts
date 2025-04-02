
import { Student } from '@/types';
import { getLocalData, saveLocalData } from './localStorage';

/**
 * API functions for managing users
 */

export const updateStudentInfo = (
  studentId: string,
  updates: { name?: string; email?: string }
): boolean => {
  try {
    const students = getLocalData<Student[]>('students', []);
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return { ...student, ...updates };
      }
      return student;
    });
    
    saveLocalData('students', updatedStudents);
    
    // If email is updated, also update in passwords
    if (updates.email) {
      const studentPasswords = getLocalData<Record<string, string>>('studentPasswords', {});
      const student = students.find(s => s.id === studentId);
      
      if (student && student.email && student.email !== updates.email) {
        const password = studentPasswords[student.email];
        
        if (password) {
          // Update email key in passwords
          const updatedPasswords = { ...studentPasswords };
          delete updatedPasswords[student.email];
          updatedPasswords[updates.email] = password;
          
          saveLocalData('studentPasswords', updatedPasswords);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating student info:', error);
    return false;
  }
};
