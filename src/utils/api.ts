
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

// Re-export proposal APIs
export {
  getProposals,
  getProposalsByProjectId,
  getProposalsByStudentId,
  getActiveProposalsByStudentId,
  hasSelectedProposal,
  wasRejectedForProject,
  createProposal,
  updateProposalStatus,
  deleteProposal
} from './proposalApi';

// Re-export user APIs
export {
  updateStudentInfo
} from './userApi';
