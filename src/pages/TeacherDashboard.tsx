import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import ProposalCard from "@/components/ProposalCard";
import NewProjectForm from "@/components/NewProjectForm";
import { Project, Proposal } from "@/types";
import { useAuth } from "@/context/AuthContext";
// import { getProjectsByTeacherId, getProposalsByProjectId, deleteProject, getProjectById } from "@/utils/api";
import { getProjectsByTeacherId, deleteProject } from "@/utils/projectApi.supabase";
import { getProposalsByProjectId } from "@/utils/api";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeacherDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectProposals, setProjectProposals] = useState<Proposal[]>([]);
  const [refreshData, setRefreshData] = useState(0);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.role === 'teacher') {
        const teacherProjects = await getProjectsByTeacherId(user.id);
        setProjects(teacherProjects);
        // Fetch proposal counts for all projects
        const counts: Record<string, number> = {};
        await Promise.all(
          teacherProjects.map(async (project) => {
            try {
              const proposals = await getProposalsByProjectId(project.id);
              counts[project.id] = proposals.length;
            } catch {
              counts[project.id] = 0;
            }
          })
        );
        setProposalCounts(counts);
      }
    };
    fetchData();
  }, [user, refreshData]);

  const handleRefreshData = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    toast({
      title: "تم حذف المشروع",
      description: "تم حذف المشروع بنجاح",
    });
  };
  
  const handleViewProposals = async (project: Project) => {
    setSelectedProject(project);
    try {
      const proposals = await getProposalsByProjectId(project.id);
      setProjectProposals(proposals);
    } catch (error) {
      setProjectProposals([]);
    }
  };
  
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      setDeleteLoading(true);
      try {
        await handleDeleteProject(projectToDelete.id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        handleRefreshData();
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };
  
  // Fix: Use project.name instead of project.title due to schema update
  const filteredProjects = projects.filter(project => 
    project.name.includes(searchTerm) || 
    project.description.includes(searchTerm)
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="لوحة تحكم الأستاذ" />
      
      <main className="flex-1 container py-6">
        <Tabs defaultValue="my-projects" className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="my-projects">مشاريعي</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A2540]/50" />
                <Input
                  placeholder="البحث في المشاريع..."
                  className="pr-3 rtl:pl-10 text-right placeholder:text-right"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
              </div>
              
              <Button onClick={() => setShowNewProjectForm(true)}>
                <Plus className="h-4 w-4" />
                مشروع جديد
              </Button>
            </div>
          </div>
          
          <TabsContent value="my-projects" className="space-y-4">
            <h2 className="text-xl font-bold rtl-text">مشاريعي ({projects.length})</h2>
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لم تقم بإنشاء أي مشاريع بعد.</p>
                <Button 
                  onClick={() => setShowNewProjectForm(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4" />
                  إنشاء مشروع جديد
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    proposalCount={proposalCounts[project.id] || 0}
                    onDeleteProject={() => handleDeleteClick(project)}
                    onViewProposals={handleViewProposals}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <NewProjectForm 
        open={showNewProjectForm} 
        onOpenChange={setShowNewProjectForm} 
        onProjectCreated={handleRefreshData} 
      />
      
      <Dialog 
        open={!!selectedProject} 
        onOpenChange={(open) => !open && setSelectedProject(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-right">
              مقترحات المشروع: {selectedProject?.name}
            </DialogTitle>
            <DialogDescription className="text-right">
              عرض وإدارة المقترحات المقدمة لهذا المشروع
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {projectProposals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">لا توجد مقترحات مقدمة لهذا المشروع حتى الآن.</p>
              </div>
            ) : (
              <div className="max-h-[270px] md:max-h-[320px] w-full overflow-y-auto grid grid-cols-1 gap-4 custom-scroll-area pt-6 pb-6 px-3 md:px-6">
                {projectProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onStatusChange={async (updatedProposal) => {
                      setProjectProposals((prev) =>
                        prev.map((p) =>
                          p.id === updatedProposal.id ? { ...p, ...updatedProposal } : p
                        )
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المشروع</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف المشروع "{projectToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteLoading}>
              {deleteLoading ? "...جاري الحذف" : "حذف"}
            </Button>
            <Button variant="outline" onClick={handleCancelDelete} disabled={deleteLoading}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
