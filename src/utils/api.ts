
import { Project, Proposal, Student, Teacher } from '@/types';
import { initialTeachers } from '@/context/AuthContext';

// Helper to get data from localStorage
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Helper to save data to localStorage
const saveLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Project APIs
export const getProjects = (): Project[] => {
  return getLocalData<Project[]>('projects', []);
};

export const getProjectById = (id: string): Project | undefined => {
  const projects = getProjects();
  return projects.find(project => project.id === id);
};

export const getProjectsByTeacherId = (teacherId: string): Project[] => {
  const projects = getProjects();
  return projects.filter(project => project.teacherId === teacherId);
};

export const createProject = (
  title: string, 
  description: string, 
  teacherId: string, 
  teacherName: string
): Project => {
  const projects = getProjects();
  const newProject: Project = {
    id: `project-${Date.now()}`,
    title,
    description,
    teacherId,
    teacherName,
    proposals: [],
    createdAt: new Date().toISOString(),
  };
  
  saveLocalData('projects', [...projects, newProject]);
  return newProject;
};

export const deleteProject = (id: string): void => {
  const projects = getProjects();
  const updatedProjects = projects.filter(project => project.id !== id);
  
  // Also delete related proposals
  const proposals = getProposals();
  const updatedProposals = proposals.filter(proposal => proposal.projectId !== id);
  
  saveLocalData('projects', updatedProjects);
  saveLocalData('proposals', updatedProposals);
  
  // Update students who had proposals for this project
  const students = getLocalData<Student[]>('students', []);
  const updatedStudents = students.map(student => ({
    ...student,
    proposals: student.proposals.filter(p => p.projectId !== id)
  }));
  
  saveLocalData('students', updatedStudents);
};

// Proposal APIs
export const getProposals = (): Proposal[] => {
  return getLocalData<Proposal[]>('proposals', []);
};

export const getProposalsByProjectId = (projectId: string): Proposal[] => {
  const proposals = getProposals();
  return proposals.filter(proposal => proposal.projectId === projectId);
};

export const getProposalsByStudentId = (studentId: string): Proposal[] => {
  const proposals = getProposals();
  return proposals.filter(proposal => proposal.studentId === studentId);
};

export const createProposal = (
  projectId: string, 
  studentId: string, 
  studentName: string
): Proposal | null => {
  const proposals = getProposals();
  
  // Check if student already has 3 proposals
  const studentProposals = proposals.filter(
    proposal => proposal.studentId === studentId
  );
  
  if (studentProposals.length >= 3) {
    return null;
  }
  
  // Check if student already proposed to this project
  if (studentProposals.some(proposal => proposal.projectId === projectId)) {
    return null;
  }
  
  const newProposal: Proposal = {
    id: `proposal-${Date.now()}`,
    projectId,
    studentId,
    studentName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  // Update proposals list
  saveLocalData('proposals', [...proposals, newProposal]);
  
  // Update student's proposals list
  const students = getLocalData<Student[]>('students', []);
  const updatedStudents = students.map(student => {
    if (student.id === studentId) {
      return {
        ...student,
        proposals: [...student.proposals, newProposal],
      };
    }
    return student;
  });
  
  saveLocalData('students', updatedStudents);
  
  // Update project's proposals list
  const projects = getProjects();
  const updatedProjects = projects.map(project => {
    if (project.id === projectId) {
      return {
        ...project,
        proposals: [...project.proposals, newProposal],
      };
    }
    return project;
  });
  
  saveLocalData('projects', updatedProjects);
  
  return newProposal;
};

export const updateProposalStatus = (
  proposalId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'selected'
): void => {
  const proposals = getProposals();
  
  // Update the proposal status
  const updatedProposals = proposals.map(proposal => {
    if (proposal.id === proposalId) {
      return { ...proposal, status };
    }
    return proposal;
  });
  
  saveLocalData('proposals', updatedProposals);
  
  // Find the updated proposal
  const updatedProposal = updatedProposals.find(p => p.id === proposalId);
  
  if (!updatedProposal) return;
  
  // Update the student's proposal list
  const students = getLocalData<Student[]>('students', []);
  const updatedStudents = students.map(student => {
    if (student.id === updatedProposal.studentId) {
      return {
        ...student,
        proposals: student.proposals.map(p => 
          p.id === proposalId ? { ...p, status } : p
        ),
      };
    }
    return student;
  });
  
  saveLocalData('students', updatedStudents);
  
  // Update the project's proposal list
  const projects = getProjects();
  const updatedProjects = projects.map(project => {
    if (project.id === updatedProposal.projectId) {
      return {
        ...project,
        proposals: project.proposals.map(p => 
          p.id === proposalId ? { ...p, status } : p
        ),
      };
    }
    return project;
  });
  
  saveLocalData('projects', updatedProjects);
  
  // If this proposal was selected, reject other approved proposals
  if (status === 'selected') {
    const studentId = updatedProposal.studentId;
    const otherProposals = updatedProposals.filter(
      p => p.studentId === studentId && p.id !== proposalId && p.status === 'approved'
    );
    
    otherProposals.forEach(p => updateProposalStatus(p.id, 'rejected'));
  }
};

export const deleteProposal = (id: string): void => {
  const proposals = getProposals();
  const proposalToDelete = proposals.find(p => p.id === id);
  
  if (!proposalToDelete) return;
  
  // Remove from proposals list
  const updatedProposals = proposals.filter(proposal => proposal.id !== id);
  saveLocalData('proposals', updatedProposals);
  
  // Update student's proposals list
  const students = getLocalData<Student[]>('students', []);
  const updatedStudents = students.map(student => {
    if (student.id === proposalToDelete.studentId) {
      return {
        ...student,
        proposals: student.proposals.filter(p => p.id !== id),
      };
    }
    return student;
  });
  
  saveLocalData('students', updatedStudents);
  
  // Update project's proposals list
  const projects = getProjects();
  const updatedProjects = projects.map(project => {
    if (project.id === proposalToDelete.projectId) {
      return {
        ...project,
        proposals: project.proposals.filter(p => p.id !== id),
      };
    }
    return project;
  });
  
  saveLocalData('projects', updatedProjects);
};

// Initialize the local storage with dummy data if needed
export const initializeData = (): void => {
  // Initialize teachers if not present
  const teachers = getLocalData<Teacher[]>('teachers', []);
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
};
