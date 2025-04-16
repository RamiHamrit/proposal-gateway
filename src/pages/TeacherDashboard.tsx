import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.role === 'teacher') {
        const teacherProjects = await getProjectsByTeacherId(user.id);
        setProjects(teacherProjects);
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
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المشاريع..."
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button onClick={() => setShowNewProjectForm(true)}>
                <Plus className="h-4 w-4 ml-2" />
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
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء مشروع جديد
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDeleteProject={handleDeleteProject}
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
              <div className="grid grid-cols-1 gap-4">
                {projectProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onStatusChange={async () => {
                      if (selectedProject) {
                        try {
                          const updatedProposals = await getProposalsByProjectId(selectedProject.id);
                          setProjectProposals(updatedProposals);
                        } catch {
                          setProjectProposals([]);
                        }
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
