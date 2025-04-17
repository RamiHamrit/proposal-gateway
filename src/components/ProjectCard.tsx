import { useState } from "react";
import { Project, Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, FileText, User, CheckCircle2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import ProposalForm from "./ProposalForm";
import { useAuth } from "@/context/AuthContext";
import { hasSelectedProposal, wasRejectedForProject, isProjectSelectedByAnyStudent, isArabicText } from "@/utils/api";

interface ProjectCardProps {
  project: Project;
  userProposals?: Proposal[];
  proposalCount?: number;
  onDeleteProject?: (id: string) => void;
  onViewProposals?: (project: Project) => void;
  onProposalSubmit?: () => void;
}

const ProjectCard = ({
  project,
  userProposals,
  proposalCount,
  onDeleteProject,
  onViewProposals,
  onProposalSubmit
}: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const {
    user
  } = useAuth();
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isProjectOwner = isTeacher && user?.id === project.created_by;
  const userProposal = userProposals?.find(p => p.project_id === project.id);
  const wasRejectedBefore = isStudent && user ? wasRejectedForProject(user.id, project.id) : false;
  const hasSelectedFinalProject = isStudent && user ? hasSelectedProposal(user.id) : false;

  // Check if this project is already selected by another student
  const isProjectReserved = isProjectSelectedByAnyStudent(project.id);
  const formattedDate = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: true,
    locale: arSA
  });
  
  // Check if project title is in Arabic
  const titleInArabic = isArabicText(project.name);
  
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
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(60,60,60,0.08)] hover:-translate-y-1 rounded-xl ${expanded ? 'shadow-sm' : ''}`}>
      <CardHeader className="p-4 cursor-pointer rtl-text" onClick={toggleExpand}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-xl text-right ${!titleInArabic ? 'en' : ''}`}>{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            {isProjectReserved && (
              <Badge variant="info" className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>محجوز</span>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              toggleExpand();
            }} className="mr-auto">
              <span className="transition-transform duration-300" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDown size={18} />
              </span>
            </Button>
          </div>
        </div>
        {!expanded && (
          <CardDescription className="flex items-center text-sm gap-3 mt-3">
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <User size={12} />
              <span>{project.teacher_name}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 font-medium">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </Badge>
          </CardDescription>
        )}
      </CardHeader>
      
      {expanded && (
        <>
          <CardContent className="p-4 pt-0 rtl-text">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="flex items-center gap-1 font-medium">
                <User size={12} />
                <span>{project.teacher_name}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 font-medium">
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </Badge>
              {isProjectReserved && (
                <Badge variant="info" className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>محجوز</span>
                </Badge>
              )}
            </div>
            
            <div className="bg-[#F8F9FA] p-4 rounded-md">
              <div className="flex items-start gap-2 text-right">
                <ScrollArea className="h-[100px] w-full pl-4">
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </ScrollArea>
                <FileText size={16} className="mt-1 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between p-4 pt-2 gap-2">
            {isStudent && (
              <>
                {userProposal ? (
                  <Badge 
                    className="mr-auto" 
                    variant={
                      userProposal.status === 'approved' 
                        ? 'success'
                        : userProposal.status === 'rejected' 
                          ? 'destructive' 
                          : userProposal.status === 'selected' 
                            ? 'info' 
                            : 'warning'
                    }
                  >
                    {userProposal.status === 'pending' && 'في انتظار الموافقة'}
                    {userProposal.status === 'approved' && 'تمت الموافقة'}
                    {userProposal.status === 'rejected' && 'تم الرفض'}
                    {userProposal.status === 'selected' && 'تم الاختيار'}
                  </Badge>
                ) : wasRejectedBefore ? (
                  <Badge className="mr-auto" variant="destructive">
                    تم رفض مقترحك سابقًا
                  </Badge>
                ) : hasSelectedFinalProject ? (
                  <Badge className="mr-auto" variant="info">
                    لديك مشروع نهائي بالفعل
                  </Badge>
                ) : isProjectReserved ? (
                  <Badge className="mr-auto" variant="info">
                    المشروع محجوز من طالب آخر
                  </Badge>
                ) : (
                  <Button 
                    onClick={() => setShowProposalForm(true)} 
                    className="mr-auto ml-0" 
                    disabled={
                      (userProposals && userProposals.length >= 3) || 
                      hasSelectedFinalProject || 
                      wasRejectedBefore || 
                      isProjectReserved
                    }
                  >
                    {userProposals && userProposals.length >= 3 
                      ? 'الحد الأقصى للمقترحات (3)' 
                      : hasSelectedFinalProject 
                        ? 'لديك مشروع نهائي بالفعل' 
                        : wasRejectedBefore 
                          ? 'تم رفض مقترحك سابقًا' 
                          : isProjectReserved 
                            ? 'المشروع محجوز من طالب آخر' 
                            : 'تقديم مقترح'
                    }
                  </Button>
                )}
              </>
            )}
            
            {isProjectOwner && (
              <div className="flex gap-2 mr-auto">
                <Button 
                  onClick={e => {
                    e.stopPropagation();
                    if (onDeleteProject) onDeleteProject(project.id);
                  }} 
                  variant="destructive"
                >
                  حذف المشروع
                </Button>
                <Button 
                  onClick={e => {
                    e.stopPropagation();
                    if (onViewProposals) onViewProposals(project);
                  }} 
                  variant="outline"
                >
                  عرض المقترحات{typeof proposalCount === 'number' ? ` (${proposalCount})` : ''}
                </Button>
              </div>
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
