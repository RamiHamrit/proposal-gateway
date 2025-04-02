
import { Project } from '@/types';
import { getLocalData, saveLocalData } from './localStorage';
import { getProposals } from './proposalApi';

/**
 * API functions for managing projects
 */

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
  const students = getLocalData<any[]>('students', []);
  const updatedStudents = students.map(student => ({
    ...student,
    proposals: student.proposals.filter((p: any) => p.projectId !== id)
  }));
  
  saveLocalData('students', updatedStudents);
};
