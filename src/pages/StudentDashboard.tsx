
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import ProposalCard from "@/components/ProposalCard";
import { Project, Proposal } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getProjects, getProposalsByStudentId, getProjectById } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const StudentDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProposals, setUserProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshData, setRefreshData] = useState(0);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = () => {
      if (user && user.role === 'student') {
        // Fetch all projects
        const allProjects = getProjects();
        setProjects(allProjects);
        
        // Fetch user's proposals
        const proposals = getProposalsByStudentId(user.id);
        setUserProposals(proposals);
      }
    };
    
    fetchData();
  }, [user, refreshData]);
  
  const handleRefreshData = () => {
    setRefreshData(prev => prev + 1);
  };
  
  const filteredProjects = projects.filter(project => 
    project.title.includes(searchTerm) || 
    project.description.includes(searchTerm) ||
    project.teacherName.includes(searchTerm)
  );
  
  // Get project details for each proposal
  const proposalsWithProjects = userProposals.map(proposal => {
    const project = getProjectById(proposal.projectId);
    return {
      ...proposal,
      projectTitle: project?.title || "مشروع غير معروف"
    };
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="لوحة تحكم الطالب" />
      
      <main className="flex-1 container py-6">
        <Tabs defaultValue="projects" className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="projects">المشاريع المتاحة</TabsTrigger>
              <TabsTrigger value="proposals">
                مقترحاتي
                {userProposals.length > 0 && (
                  <span className="mr-2 bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                    {userProposals.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن مشروع..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="projects" className="space-y-4">
            <h2 className="text-xl font-bold">المشاريع المتاحة للتقديم</h2>
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد مشاريع متاحة حاليًا.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    userProposals={userProposals}
                    onDeleteProject={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="proposals" className="space-y-4">
            <h2 className="text-xl font-bold">مقترحاتي ({userProposals.length}/3)</h2>
            
            {userProposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لم تقدم أي مقترحات بعد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proposalsWithProjects.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    projectTitle={proposal.projectTitle}
                    onStatusChange={handleRefreshData}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
