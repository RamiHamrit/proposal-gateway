import { Proposal } from '@/types';
import { supabase } from '@/lib/supabaseClient';

// Fetch all proposals from Supabase
export async function getProposals(): Promise<Proposal[]> {
  const { data, error } = await supabase.from('proposals').select('*');
  if (error) throw error;
  return data as Proposal[];
}

// Fetch proposals by project ID with student name
export async function getProposalsByProjectId(projectId: string): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*, user:users(name)')
    .eq('project_id', projectId);
  if (error) throw error;
  // Map the student name into the proposal object
  return (data as any[]).map(p => ({ ...p, student_name: p.user?.name }));
}

// Fetch proposals by user ID
export async function getProposalsByUserId(user_id: string): Promise<Proposal[]> {
  const { data, error } = await supabase.from('proposals').select('*').eq('user_id', user_id);
  if (error) throw error;
  return data as Proposal[];
}

// Create a new proposal in Supabase
export async function createProposal(
  project_id: string,
  user_id: string,
  content: string
): Promise<Proposal | null> {
  // Check if user already has a selected proposal (final project)
  const { data: existingProposals, error: fetchError } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'selected');
  if (fetchError) throw fetchError;
  if (existingProposals && existingProposals.length > 0) {
    // User already has a final project, do not allow another
    return null;
  }

  // Proceed to create new proposal
  const { data, error } = await supabase
    .from('proposals')
    .insert([
      {
        project_id,
        user_id,
        content,
        status: 'pending' // default status
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data as Proposal;
}

// Delete a proposal from Supabase
export async function deleteProposal(id: string): Promise<void> {
  const { error } = await supabase.from('proposals').delete().eq('id', id);
  if (error) throw error;
}

// Update proposal status in Supabase
export async function updateProposalStatus(
  proposalId: string,
  status: 'pending' | 'approved' | 'rejected' | 'selected'
): Promise<void> {
  // First, get the proposal to find the user_id
  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single();
  if (fetchError) throw fetchError;
  if (!proposal) throw new Error('Proposal not found');

  // If trying to select as final, check if user already has a selected proposal
  if (status === 'selected' || status === 'approved') {
    const { data: existingSelected, error: checkError } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', proposal.user_id)
      .eq('status', 'selected');
    if (checkError) throw checkError;
    // If there is already a selected proposal for this user (and it's not this one), block it
    if (existingSelected && (existingSelected.length > 0) && !(existingSelected.length === 1 && existingSelected[0].id === proposalId)) {
      throw new Error('User already has a final project');
    }
  }

  // NEW CHECK: If trying to select as final, ensure no other proposal for this project is already selected by another student
  if (status === 'selected') {
    const { data: projectSelected, error: projectSelectedError } = await supabase
      .from('proposals')
      .select('*')
      .eq('project_id', proposal.project_id)
      .eq('status', 'selected');
    if (projectSelectedError) throw projectSelectedError;
    // If there is a selected proposal for this project (not this one), block it
    if (projectSelected && (projectSelected.length > 0) && !(projectSelected.length === 1 && projectSelected[0].id === proposalId)) {
      throw new Error('Project already selected as final project by another student');
    }
  }

  const { error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', proposalId);
  if (error) throw error;
}
