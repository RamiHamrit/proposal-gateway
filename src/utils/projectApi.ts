
import { Project } from '@/types';
import { getLocalData, saveLocalData } from './localStorage';
import { getProposals } from './proposalApi';

/**
 * API functions for managing projects
 */

export const getProjects = () => {
  console.log("Fetching projects from local storage");
  return getLocalData<Project[]>('projects', []);
};

export const getProjectById = (id: string): Project | undefined => {
  console.log("Fetching project by ID from local storage:", id);
  const projects = getLocalData<Project[]>('projects', []);
  return projects.find(project => project.id === id);
};

export const getProjectsByTeacherId = (teacherId: string): Project[] => {
  console.log("Fetching projects by teacher ID from local storage:", teacherId);
  const projects = getLocalData<Project[]>('projects', []);
  return projects.filter(project => project.teacherId === teacherId);
};

export const createProject = (
  title: string, 
  description: string, 
  teacherId: string, 
  teacherName: string
): Project => {
  console.log("Creating project:", title);
  const projectId = `project-${Date.now()}`;
  
  const newProject: Project = {
    id: projectId,
    title,
    description,
    teacherId,
    teacherName,
    proposals: [],
    createdAt: new Date().toISOString(),
  };
  
  console.log("Saving project to local storage");
  const projects = getLocalData<Project[]>('projects', []);
  saveLocalData('projects', [...projects, newProject]);
  
  return newProject;
};

export const deleteProject = (id: string): void => {
  // Update local storage
  console.log("Deleting project from local storage:", id);
  const projects = getLocalData<Project[]>('projects', []);
  const updatedProjects = projects.filter(project => project.id !== id);
  saveLocalData('projects', updatedProjects);
  
  // Also delete related proposals
  const proposals = getProposals();
  const updatedProposals = proposals.filter(proposal => proposal.projectId !== id);
  saveLocalData('proposals', updatedProposals);
  
  // Update students who had proposals for this project
  const students = getLocalData<any[]>('students', []);
  const updatedStudents = students.map(student => ({
    ...student,
    proposals: student.proposals.filter((p: any) => p.projectId !== id)
  }));
  saveLocalData('students', updatedStudents);
};
