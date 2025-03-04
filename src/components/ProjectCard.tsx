
import { useState } from "react";
import { Project, Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, FileText, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import ProposalForm from "./ProposalForm";
import { useAuth } from "@/context/AuthContext";

interface ProjectCardProps {
  project: Project;
  userProposals?: Proposal[];
  onDeleteProject?: (id: string) => void;
  onViewProposals?: (project: Project) => void;
  onProposalSubmit?: () => void;
}

const ProjectCard = ({ 
  project, 
  userProposals, 
  onDeleteProject,
  onViewProposals,
  onProposalSubmit
}: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const { user } = useAuth();
  
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isProjectOwner = isTeacher && user?.id === project.teacherId;
  
  // Find if the current student has a proposal for this project
  const userProposal = userProposals?.find(p => p.projectId === project.id);
  
  // Format date in Arabic
  const formattedDate = formatDistanceToNow(new Date(project.createdAt), {
    addSuffix: true,
    locale: arSA
  });
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleSubmitProposal = () => {
    setShowProposalForm(false);
    if (onProposalSubmit) {
      onProposalSubmit();
    }
  };
  
  return (
    <Card className={`overflow-hidden card-hover ${expanded ? 'shadow-md' : ''}`}>
      <CardHeader className="p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </div>
        {!expanded && (
          <CardDescription className="flex items-center text-sm gap-2 mt-2">
            <User size={14} />
            <span>{project.teacherName}</span>
            <span className="text-xs mr-auto">{formattedDate}</span>
          </CardDescription>
        )}
      </CardHeader>
      
      {expanded && (
        <>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <User size={12} />
                <span>{project.teacherName}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formattedDate}
              </Badge>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <FileText size={16} className="mt-1 text-muted-foreground flex-shrink-0" />
                <ScrollArea className="h-[100px] w-full pr-4">
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between p-4 pt-2 gap-2">
            {isStudent && (
              <>
                {userProposal ? (
                  <Badge 
                    className={`mr-auto ${
                      userProposal.status === 'approved' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : userProposal.status === 'rejected'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : userProposal.status === 'selected'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {userProposal.status === 'pending' && 'في انتظار الموافقة'}
                    {userProposal.status === 'approved' && 'تمت الموافقة'}
                    {userProposal.status === 'rejected' && 'تم الرفض'}
                    {userProposal.status === 'selected' && 'تم الاختيار'}
                  </Badge>
                ) : (
                  <Button 
                    onClick={() => setShowProposalForm(true)} 
                    className="ml-auto"
                    disabled={userProposals && userProposals.length >= 3}
                  >
                    {userProposals && userProposals.length >= 3 
                      ? 'الحد الأقصى للمقترحات (3)' 
                      : 'تقديم مقترح'}
                  </Button>
                )}
              </>
            )}
            
            {isProjectOwner && (
              <>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onViewProposals) onViewProposals(project);
                  }} 
                  variant="outline"
                >
                  عرض المقترحات ({project.proposals.length})
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteProject) onDeleteProject(project.id);
                  }} 
                  variant="destructive"
                >
                  حذف المشروع
                </Button>
              </>
            )}
          </CardFooter>
        </>
      )}
      
      {showProposalForm && (
        <ProposalForm 
          project={project} 
          onSubmit={handleSubmitProposal} 
          onCancel={() => setShowProposalForm(false)} 
        />
      )}
    </Card>
  );
};

export default ProjectCard;
