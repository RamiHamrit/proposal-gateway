import { Project } from '@/types';
import { supabase } from '@/lib/supabaseClient';

// Fetch all projects from Supabase
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) throw error;
  return data as Project[];
}

// Fetch a single project by ID from Supabase
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Project;
}

// Fetch projects by teacher ID
export async function getProjectsByTeacherId(teacherId: string): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').eq('created_by', teacherId);
  if (error) throw error;
  return data as Project[];
}

// Create a new project in Supabase
export async function createProject(
  name: string,
  description: string,
  created_by: string,
  teacher_name?: string
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        description,
        created_by,
        teacher_name, // only if you added this field
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

// Delete a project from Supabase
export async function deleteProject(id: string): Promise<void> {
  // Delete all proposals for this project first
  const { error: proposalError } = await supabase.from('proposals').delete().eq('project_id', id);
  if (proposalError) throw proposalError;
  // Now delete the project
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
