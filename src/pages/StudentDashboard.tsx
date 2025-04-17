import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import ProposalCard from "@/components/ProposalCard";
import { Project, Proposal } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getProjects } from "@/utils/projectApi.supabase";
import { getProposalsByUserId, deleteProposal } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProposals, setUserProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshData, setRefreshData] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.role === 'student') {
        const allProjects = await getProjects();
        setProjects(allProjects);
        try {
          const proposals = await getProposalsByUserId(user.id);
          setUserProposals(proposals);
        } catch (error) {
          setUserProposals([]);
        }
      } else {
        setUserProposals([]);
        setProjects([]);
      }
    };
    fetchData();
  }, [user, refreshData]);

  const handleRefreshData = () => {
    setRefreshData(prev => prev + 1);
  };

  const handleDeleteProposal = (proposal: Proposal) => {
    setProposalToDelete(proposal);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProposal = () => {
    if (proposalToDelete) {
      deleteProposal(proposalToDelete.id);
      toast({
        title: "تم حذف المقترح",
        description: "تم حذف المقترح بنجاح",
      });
      handleRefreshData();
      setDeleteDialogOpen(false);
      setProposalToDelete(null);
    }
  };
  
  const filteredProjects = projects.filter(project => 
    (project.name && project.name.includes(searchTerm)) || 
    (project.description && project.description.includes(searchTerm)) ||
    (project.teacher_name && project.teacher_name.includes(searchTerm))
  );
  
  // Get project details for each proposal
  const proposalsWithProjects = userProposals.map(proposal => {
    // Use project_id (Supabase) instead of projectId
    const project = projects.find(p => p.id === proposal.project_id);
    return {
      ...proposal,
      projectTitle: project?.name || "مشروع غير معروف"
    };
  });
  
  return (
    <div className="min-h-screen flex flex-col text-[#0A2540]">
      <Navbar title="لوحة تحكم الطالب" />
      
      <main className="flex-1 container py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="projects">المشاريع المتاحة</TabsTrigger>
              <TabsTrigger value="proposals" className="flex flex-row-reverse items-center gap-2">
                {userProposals.length > 0 && (
                  <span className="bg-[#635BFF] text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs leading-none font-inter">
                    {userProposals.length}
                  </span>
                )}
                <span>مقترحاتي</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A2540]/50" />
              <Input
                placeholder="البحث عن مشروع..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="projects" className="space-y-6">
            <h2 className="text-xl font-bold rtl-text text-[#0A2540]">المشاريع المتاحة للتقديم</h2>
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#0A2540]/70">لا توجد مشاريع متاحة حاليًا.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    userProposals={userProposals}
                    onProposalSubmit={handleRefreshData}
                    onDeleteProject={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="proposals" className="space-y-6">
            <h2 className="text-xl font-bold rtl-text text-[#0A2540] font-tajwal-700">
              مقترحاتي <span className="font-inter">({userProposals.length}/3)</span>
            </h2>
            
            {userProposals.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-[#E4E4E7] bg-white p-8 font-tajwal-400">
                <p className="text-[#0A2540]/70">لم تقدم أي مقترحات بعد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposalsWithProjects.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    projectTitle={proposal.projectTitle}
                    onStatusChange={handleRefreshData}
                    onDeleteProposal={() => handleDeleteProposal(proposal)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right font-tajwal">تأكيد حذف المقترح</DialogTitle>
            <DialogDescription className="text-right font-tajwal">
              هل أنت متأكد من رغبتك في حذف هذا المقترح؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row-reverse gap-2 sm:justify-start">
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProposal}
              className="font-tajwal"
            >
              حذف المقترح
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="font-tajwal"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
