import { Project } from '@/types';
import { getLocalData, saveLocalData } from './localStorage';
import { getProposals } from './proposalApi';
import { supabase } from '@/integrations/supabase/client';

/**
 * API functions for managing projects
 */

export const getProjects = async () => {
  try {
    console.log("Fetching projects from Supabase");
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) {
      console.error("Error fetching projects from Supabase:", error);
      console.log("Falling back to local storage");
      return getLocalData<Project[]>('projects', []);
    }
    
    console.log("Projects fetched from Supabase:", data?.length);
    
    // Map Supabase format to our Project type
    const projects = data?.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      teacherId: p.teacher_id,
      teacherName: p.teacher_name || "Unknown",
      proposals: [],
      createdAt: p.created_at
    })) || [];
    
    // Save to local storage as well
    saveLocalData('projects', projects);
    
    return projects;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return getLocalData<Project[]>('projects', []);
  }
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  try {
    console.log("Fetching project by ID from Supabase:", id);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching project from Supabase:", error);
      console.log("Falling back to local storage");
      const projects = getLocalData<Project[]>('projects', []);
      return projects.find(project => project.id === id);
    }
    
    if (!data) {
      console.log("Project not found in Supabase, checking local storage");
      const projects = getLocalData<Project[]>('projects', []);
      return projects.find(project => project.id === id);
    }
    
    console.log("Project fetched from Supabase:", data.id);
    
    // Map Supabase format to our Project type
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      teacherId: data.teacher_id,
      teacherName: data.teacher_name || "Unknown",
      proposals: [],
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Failed to fetch project by ID:", error);
    const projects = getLocalData<Project[]>('projects', []);
    return projects.find(project => project.id === id);
  }
};

export const getProjectsByTeacherId = async (teacherId: string): Promise<Project[]> => {
  try {
    console.log("Fetching projects by teacher ID from Supabase:", teacherId);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('teacher_id', teacherId);
    
    if (error) {
      console.error("Error fetching teacher's projects from Supabase:", error);
      console.log("Falling back to local storage");
      const projects = getLocalData<Project[]>('projects', []);
      return projects.filter(project => project.teacherId === teacherId);
    }
    
    console.log("Teacher's projects fetched from Supabase:", data?.length);
    
    // Map Supabase format to our Project type
    const projects = data?.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      teacherId: p.teacher_id,
      teacherName: p.teacher_name || "Unknown",
      proposals: [],
      createdAt: p.created_at
    })) || [];
    
    // Add to local storage
    const localProjects = getLocalData<Project[]>('projects', []);
    const nonTeacherProjects = localProjects.filter(p => p.teacherId !== teacherId);
    saveLocalData('projects', [...nonTeacherProjects, ...projects]);
    
    return projects;
  } catch (error) {
    console.error("Failed to fetch teacher's projects:", error);
    const projects = getLocalData<Project[]>('projects', []);
    return projects.filter(project => project.teacherId === teacherId);
  }
};

export const createProject = async (
  title: string, 
  description: string, 
  teacherId: string, 
  teacherName: string
): Promise<Project> => {
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
  
  // Save to local storage first
  console.log("Saving project to local storage");
  const projects = getLocalData<Project[]>('projects', []);
  saveLocalData('projects', [...projects, newProject]);
  
  // Then save to Supabase
  try {
    console.log("Saving project to Supabase");
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        id: projectId,
        title,
        description,
        teacher_id: teacherId,
        teacher_name: teacherName,
        created_at: newProject.createdAt
      }])
      .select();
    
    if (error) {
      console.error("Error creating project in Supabase:", error);
      console.log("Project saved only in local storage");
    } else {
      console.log("Project created in Supabase:", data);
    }
  } catch (dbError) {
    console.error("Failed to create project in Supabase:", dbError);
    console.log("Project saved only in local storage");
  }
  
  return newProject;
};

export const deleteProject = async (id: string): Promise<void> => {
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
  
  // Delete from Supabase
  try {
    console.log("Deleting project from Supabase:", id);
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting project from Supabase:", error);
      console.log("Project deleted only from local storage");
    } else {
      console.log("Project deleted from Supabase:", id);
    }
  } catch (dbError) {
    console.error("Failed to delete project from Supabase:", dbError);
    console.log("Project deleted only from local storage");
  }
};
