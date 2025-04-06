
import { Project } from '@/types';
import { getLocalData, saveLocalData } from './localStorage';
import { getProposals } from './proposalApi';
import { supabase } from '@/integrations/supabase/client';

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

export const createProject = async (
  title: string, 
  description: string, 
  teacherId: string, 
  teacherName: string
): Promise<Project> => {
  const projects = getProjects();
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
  
  console.log("Creating project in local storage:", newProject);
  saveLocalData('projects', [...projects, newProject]);
  
  // Also create in Supabase
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        id: projectId, // Use the same ID for local and Supabase
        title,
        description,
        teacher_id: teacherId
      });
      
    if (error) {
      console.error("Error creating project in Supabase:", error);
      // We continue with local storage project even if Supabase fails
    } else {
      console.log("Project created in Supabase:", data);
    }
  } catch (dbError) {
    console.error("Failed to create project in database:", dbError);
    // Project is still created in local storage, so we continue
  }
  
  return newProject;
};

export const deleteProject = async (id: string): Promise<void> => {
  const projects = getProjects();
  const updatedProjects = projects.filter(project => project.id !== id);
  
  console.log("Deleting project in local storage:", id);
  
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
  
  // Try to delete from Supabase if connected
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting project from Supabase:", error);
      // Continue with local deletion only
    } else {
      console.log("Project deleted from Supabase:", id);
    }
  } catch (dbError) {
    console.error("Failed to delete project from database:", dbError);
    // Project is still deleted from local storage, so we continue
  }
};
