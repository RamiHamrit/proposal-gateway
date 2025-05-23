import { Proposal, Student } from '@/types';
import { getLocalData, saveLocalData } from './localStorage';
import { getProjects, getProjectsByTeacherId } from './projectApi';

/**
 * API functions for managing proposals
 */

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

export const getActiveProposalsByStudentId = (studentId: string): Proposal[] => {
  const proposals = getProposalsByStudentId(studentId);
  // Return only pending, approved, or selected proposals (exclude rejected ones)
  return proposals.filter(proposal => proposal.status !== 'rejected');
};

// Helper function to check if a student has a selected proposal
export const hasSelectedProposal = (studentId: string): boolean => {
  const proposals = getProposalsByStudentId(studentId);
  return proposals.some(proposal => proposal.status === 'selected');
};

// Helper function to check if a project has been selected by any student
export const isProjectSelectedByAnyStudent = (projectId: string): boolean => {
  const proposals = getProposalsByProjectId(projectId);
  return proposals.some(proposal => proposal.status === 'selected');
};

// New function to check if a student was previously rejected for a project
export const wasRejectedForProject = (studentId: string, projectId: string): boolean => {
  // Get all proposals, including deleted ones with rejection status
  const rejectedProposals = getLocalData<{studentId: string, projectId: string}[]>('rejectedProposals', []);
  return rejectedProposals.some(p => p.studentId === studentId && p.projectId === projectId);
};

export const createProposal = (
  projectId: string, 
  studentId: string, 
  studentName: string
): Proposal | null => {
  const proposals = getProposals();
  
  // Check if student already has a selected proposal
  if (hasSelectedProposal(studentId)) {
    return null;
  }
  
  // Check if student already has 3 ACTIVE proposals (excluding rejected ones)
  const activeProposals = getActiveProposalsByStudentId(studentId);
  
  if (activeProposals.length >= 3) {
    return null;
  }
  
  // Check if student already proposed to this project
  const studentProposals = proposals.filter(
    proposal => proposal.studentId === studentId
  );
  
  if (studentProposals.some(proposal => proposal.projectId === projectId)) {
    return null;
  }
  
  // Check if student was previously rejected for this project (even if deleted)
  if (wasRejectedForProject(studentId, projectId)) {
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
  
  // If status is rejected, add to rejected proposals tracking
  if (status === 'rejected') {
    const rejectedProposals = getLocalData<{studentId: string, projectId: string}[]>('rejectedProposals', []);
    // Check if this combination doesn't already exist
    if (!rejectedProposals.some(p => 
      p.studentId === updatedProposal.studentId && 
      p.projectId === updatedProposal.projectId
    )) {
      saveLocalData('rejectedProposals', [
        ...rejectedProposals, 
        {
          studentId: updatedProposal.studentId,
          projectId: updatedProposal.projectId
        }
      ]);
    }
  }
  
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
  
  // We don't need to do anything special here for rejected proposals
  // since we're now tracking them separately in 'rejectedProposals'
  
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

/**
 * Get all proposals for all projects created by a teacher
 */
export const getAllProposalsForTeacher = (teacherId: string): Proposal[] => {
  // Get all projects for this teacher
  const teacherProjects = getProjectsByTeacherId(teacherId);
  // Get all proposals
  const allProposals = getProposals();
  // Filter proposals that belong to the teacher's projects
  return allProposals.filter(proposal => 
    teacherProjects.some(project => project.id === proposal.projectId)
  );
};
