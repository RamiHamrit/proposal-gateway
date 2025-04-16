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
): Promise<Proposal> {
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
  const { error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', proposalId);
  if (error) throw error;
}
