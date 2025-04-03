
import { supabase } from "@/integrations/supabase/client";
import { Project, Proposal } from "@/types";
import { Tables } from "@/types/database.types";

// Utility functions to convert between database and app types
const mapDbProjectToProject = (dbProject: Tables<"projects">): Project => {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    teacherId: dbProject.teacher_id,
    teacherName: "",  // This will be filled in by the caller
    proposals: [],    // This will be filled in by the caller
    createdAt: dbProject.created_at
  };
};

const mapDbProposalToProposal = (dbProposal: Tables<"proposals">): Proposal => {
  return {
    id: dbProposal.id,
    projectId: dbProposal.project_id,
    studentId: dbProposal.student_id,
    studentName: "",  // This will be filled in by the caller
    status: dbProposal.status as "pending" | "approved" | "rejected" | "selected",
    createdAt: dbProposal.created_at
  };
};

// Projects
export const fetchProjects = async (): Promise<Project[]> => {
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("*");

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
    return [];
  }

  // Get all teacher IDs to fetch their names
  const teacherIds = [...new Set(projectsData.map(p => p.teacher_id))];
  
  // Fetch teacher names
  const { data: teachersData, error: teachersError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", teacherIds);

  if (teachersError) {
    console.error("Error fetching teacher names:", teachersError);
  }

  // Create a map of teacher IDs to names
  const teacherMap = new Map();
  teachersData?.forEach(teacher => {
    teacherMap.set(teacher.id, teacher.name);
  });

  // Fetch all proposals to associate with projects
  const { data: proposalsData, error: proposalsError } = await supabase
    .from("proposals")
    .select("*");

  if (proposalsError) {
    console.error("Error fetching proposals:", proposalsError);
  }

  // Map projects data to Project type
  const projects = projectsData.map(dbProject => {
    const project = mapDbProjectToProject(dbProject);
    
    // Add teacher name
    project.teacherName = teacherMap.get(project.teacherId) || "Unknown Teacher";
    
    // Add proposals for this project
    project.proposals = proposalsData
      ? proposalsData
        .filter(p => p.project_id === dbProject.id)
        .map(mapDbProposalToProposal)
      : [];
      
    return project;
  });

  return projects;
};

export const fetchProjectById = async (id: string): Promise<Project | undefined> => {
  const { data: dbProject, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return undefined;
  }

  // Fetch teacher name
  const { data: teacher, error: teacherError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", dbProject.teacher_id)
    .single();

  if (teacherError) {
    console.error("Error fetching teacher:", teacherError);
  }

  // Fetch proposals for this project
  const { data: proposalsData, error: proposalsError } = await supabase
    .from("proposals")
    .select("*, profiles!inner(name)")
    .eq("project_id", id);

  if (proposalsError) {
    console.error("Error fetching proposals:", proposalsError);
  }

  const project = mapDbProjectToProject(dbProject);
  project.teacherName = teacher?.name || "Unknown Teacher";
  
  // Add proposals for this project
  project.proposals = proposalsData
    ? proposalsData.map(p => ({
        id: p.id,
        projectId: p.project_id,
        studentId: p.student_id,
        studentName: p.profiles?.name || "Unknown Student",
        status: p.status as "pending" | "approved" | "rejected" | "selected",
        createdAt: p.created_at
      }))
    : [];

  return project;
};

export const fetchProjectsByTeacherId = async (teacherId: string): Promise<Project[]> => {
  const { data: projectsData, error } = await supabase
    .from("projects")
    .select("*")
    .eq("teacher_id", teacherId);

  if (error) {
    console.error("Error fetching teacher projects:", error);
    return [];
  }

  // Fetch teacher name
  const { data: teacher, error: teacherError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", teacherId)
    .single();

  if (teacherError) {
    console.error("Error fetching teacher:", teacherError);
  }

  // Fetch all proposals for these projects
  const projectIds = projectsData.map(p => p.id);
  const { data: proposalsData, error: proposalsError } = await supabase
    .from("proposals")
    .select("*, profiles!inner(name)")
    .in("project_id", projectIds);

  if (proposalsError) {
    console.error("Error fetching proposals:", proposalsError);
  }

  // Group proposals by project
  const proposalsByProject = new Map();
  proposalsData?.forEach(p => {
    if (!proposalsByProject.has(p.project_id)) {
      proposalsByProject.set(p.project_id, []);
    }
    proposalsByProject.get(p.project_id).push({
      id: p.id,
      projectId: p.project_id,
      studentId: p.student_id,
      studentName: p.profiles?.name || "Unknown Student",
      status: p.status as "pending" | "approved" | "rejected" | "selected",
      createdAt: p.created_at
    });
  });

  // Map projects data to Project type
  const projects = projectsData.map(dbProject => {
    const project = mapDbProjectToProject(dbProject);
    project.teacherName = teacher?.name || "Unknown Teacher";
    project.proposals = proposalsByProject.get(dbProject.id) || [];
    return project;
  });

  return projects;
};

export const createProject = async (
  title: string, 
  description: string, 
  teacherId: string
): Promise<Project | null> => {
  // Fetch teacher name first
  const { data: teacher, error: teacherError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", teacherId)
    .single();

  if (teacherError) {
    console.error("Error fetching teacher:", teacherError);
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      description,
      teacher_id: teacherId
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    teacherId: data.teacher_id,
    teacherName: teacher.name,
    proposals: [],
    createdAt: data.created_at
  };
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    return false;
  }

  return true;
};

// Proposals
export const fetchProposals = async (): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from("proposals")
    .select("*, profiles!inner(name)");

  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    projectId: p.project_id,
    studentId: p.student_id,
    studentName: p.profiles?.name || "Unknown Student",
    status: p.status as "pending" | "approved" | "rejected" | "selected",
    createdAt: p.created_at
  }));
};

export const fetchProposalsByProjectId = async (projectId: string): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from("proposals")
    .select("*, profiles!inner(name)")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching project proposals:", error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    projectId: p.project_id,
    studentId: p.student_id,
    studentName: p.profiles?.name || "Unknown Student",
    status: p.status as "pending" | "approved" | "rejected" | "selected",
    createdAt: p.created_at
  }));
};

export const fetchProposalsByStudentId = async (studentId: string): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from("proposals")
    .select("*, projects!inner(title)")
    .eq("student_id", studentId);

  if (error) {
    console.error("Error fetching student proposals:", error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    projectId: p.project_id,
    studentId: p.student_id,
    studentName: "",  // Not needed when fetching for the student themselves
    status: p.status as "pending" | "approved" | "rejected" | "selected",
    createdAt: p.created_at,
    projectTitle: p.projects?.title
  }));
};

export const createProposal = async (
  projectId: string,
  studentId: string
): Promise<Proposal | null> => {
  // Check if student already has a selected proposal
  const { data: selectedProposals, error: checkError } = await supabase
    .from("proposals")
    .select("id")
    .eq("student_id", studentId)
    .eq("status", "selected");

  if (checkError) {
    console.error("Error checking existing proposals:", checkError);
    return null;
  }

  if (selectedProposals.length > 0) {
    console.error("Student already has a selected proposal");
    return null;
  }

  // Check if student already has 3 active proposals
  const { data: activeProposals, error: activeError } = await supabase
    .from("proposals")
    .select("id")
    .eq("student_id", studentId)
    .not("status", "eq", "rejected");

  if (activeError) {
    console.error("Error checking active proposals:", activeError);
    return null;
  }

  if (activeProposals.length >= 3) {
    console.error("Student already has 3 active proposals");
    return null;
  }

  // Check if student already proposed to this project
  const { data: existingProposals, error: existingError } = await supabase
    .from("proposals")
    .select("id")
    .eq("student_id", studentId)
    .eq("project_id", projectId);

  if (existingError) {
    console.error("Error checking existing proposals:", existingError);
    return null;
  }

  if (existingProposals.length > 0) {
    console.error("Student already proposed to this project");
    return null;
  }
  
  // Fetch student info
  const { data: student, error: studentError } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", studentId)
    .single();

  if (studentError) {
    console.error("Error fetching student:", studentError);
    return null;
  }

  // Create proposal
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      project_id: projectId,
      student_id: studentId,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating proposal:", error);
    return null;
  }

  return {
    id: data.id,
    projectId: data.project_id,
    studentId: data.student_id,
    studentName: student.name,
    status: data.status as "pending" | "approved" | "rejected" | "selected",
    createdAt: data.created_at
  };
};

export const updateProposalStatus = async (
  proposalId: string,
  status: "pending" | "approved" | "rejected" | "selected"
): Promise<boolean> => {
  // First update the proposal status
  const { error } = await supabase
    .from("proposals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (error) {
    console.error("Error updating proposal status:", error);
    return false;
  }

  // If this proposal was selected, reject other approved proposals from the same student
  if (status === "selected") {
    // Get the student_id for this proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("student_id")
      .eq("id", proposalId)
      .single();

    if (fetchError) {
      console.error("Error fetching proposal:", fetchError);
      return true; // We still updated the original proposal successfully
    }

    // Update other approved proposals to rejected
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("student_id", proposal.student_id)
      .eq("status", "approved")
      .neq("id", proposalId);

    if (updateError) {
      console.error("Error updating other proposals:", updateError);
    }
  }

  return true;
};

export const deleteProposal = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting proposal:", error);
    return false;
  }

  return true;
};
