/**
 * Main API module that re-exports all API functions from the separate modules
 */

// Re-export localStorage utilities
export { 
  getLocalData, 
  saveLocalData, 
  initializeData 
} from './localStorage';

// Re-export project APIs
export {
  getProjects,
  getProjectById,
  getProjectsByTeacherId,
  createProject,
  deleteProject
} from './projectApi';

// Re-export proposal APIs (Supabase version)
export {
  getProposals,
  getProposalsByProjectId as getProposalsByProjectId,
  getProposalsByUserId,
  createProposal,
  deleteProposal,
  updateProposalStatus
} from './proposalApi.supabase';

// Re-export proposal logic helpers (from local version for now)
export {
  hasSelectedProposal,
  wasRejectedForProject,
  isProjectSelectedByAnyStudent
} from './proposalApi';

// Re-export user APIs
export {
  updateStudentInfo
} from './userApi';

/**
 * Utility to detect language direction (Arabic vs non-Arabic)
 */
export const isArabicText = (text: string): boolean => {
  // Arabic Unicode range
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};
