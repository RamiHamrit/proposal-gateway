import { Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { updateProposalStatus, deleteProposal, getProposalsByProjectId, getProposalsByUserId } from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface ProposalCardProps {
  proposal: Proposal;
  projectTitle?: string;
  onStatusChange?: (updatedProposal?: Proposal) => void;
  onDeleteProposal?: () => void;
}

// Fix: Support both camelCase and snake_case for proposal fields
const getProposalField = (proposal: any, field: string) => proposal[field] || proposal[field.replace(/_([a-z])/g, g => g[1].toUpperCase())];

const ProposalCard = ({ 
  proposal, 
  projectTitle,
  onStatusChange,
  onDeleteProposal
}: ProposalCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  
  // Use created_at or fallback to createdAt
  const createdAt = getProposalField(proposal, 'created_at') || new Date();
  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: arSA
  });
  
  // Helper function to check status
  const hasStatus = (status: 'pending' | 'approved' | 'rejected' | 'selected') => {
    return getProposalField(proposal, 'status') === status;
  };
  
  const [pending, setPending] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [studentHasFinal, setStudentHasFinal] = useState<boolean>(false);

  // Check if the student already has a final project
  useEffect(() => {
    async function checkStudentFinal() {
      if (proposal.user_id) {
        const proposals = await getProposalsByUserId(proposal.user_id);
        setStudentHasFinal(proposals.some((p) => p.status === 'selected'));
      }
    }
    checkStudentFinal();
  }, [proposal.user_id]);

  const handleApprove = async () => {
    setPending(true);
    try {
      // Check if there is already a selected proposal for this project (final project)
      const projectProposals = await getProposalsByProjectId(getProposalField(proposal, 'project_id') || getProposalField(proposal, 'projectId'));
      const hasSelectedProposal = projectProposals.some(
        p => p.status === 'selected'
      );
      if (hasSelectedProposal) {
        toast({
          title: "تنبيه",
          description: "المشروع تم اختياره بالفعل كمشروع نهائي. لا يمكن الموافقة على مقترحات أخرى.",
          variant: "destructive"
        });
        setPending(false);
        return;
      }
      await updateProposalStatus(getProposalField(proposal, 'id'), 'approved');
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على مقترح الطالب",
      });
      if (onStatusChange) await onStatusChange({ ...proposal, status: 'approved' });
    } catch (error: any) {
      // If backend blocks due to already having a final project
      if (error.message && error.message.includes('User already has a final project')) {
        toast({
          title: "تنبيه",
          description: "لا يمكن الموافقة على هذا المقترح لأن الطالب لديه مشروع نهائي بالفعل!",
          variant: "destructive"
        });
      } else {
        toast({
          title: "حدث خطأ",
          description: error.message || "تعذر الموافقة على المقترح.",
          variant: "destructive"
        });
      }
    } finally {
      setPending(false);
    }
  };
  
  const handleReject = async () => {
    setPending(true);
    try {
      await updateProposalStatus(getProposalField(proposal, 'id'), 'rejected');
      toast({
        title: "تم الرفض",
        description: "تم رفض مقترح الطالب",
      });
      if (onStatusChange) await onStatusChange({ ...proposal, status: 'rejected' });
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message || "تعذر رفض المقترح.",
        variant: "destructive"
      });
    } finally {
      setPending(false);
    }
  };
  
  const handleSelect = async () => {
    try {
      await updateProposalStatus(getProposalField(proposal, 'id'), 'selected');
      toast({
        title: "تم الاختيار",
        description: "تم اختيار هذا المشروع كمشروعك النهائي",
      });
      if (onStatusChange) await onStatusChange({ ...proposal, status: 'selected' });
    } catch (error: any) {
      // If backend blocks due to already having a final project
      if (error.message && error.message.includes('User already has a final project')) {
        toast({
          title: "تنبيه",
          description: "لقد قمت باختيار مشروع نهائي بالفعل!",
          variant: "destructive"
        });
      } else if (error.message && error.message.includes('Project already selected as final project by another student')) {
        toast({
          title: "تنبيه",
          description: "المشروع تم اختياره بالفعل كمشروع نهائي من قبل طالب آخر!",
          variant: "destructive"
        });
      } else {
        toast({
          title: "حدث خطأ",
          description: error.message || "تعذر اختيار المشروع النهائي.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleDelete = async () => {
    if (onDeleteProposal) {
      onDeleteProposal();
    } else {
      await deleteProposal(getProposalField(proposal, 'id'));
      toast({
        title: "تم الحذف",
        description: "تم حذف المقترح بنجاح",
      });
      if (onStatusChange) await onStatusChange();
    }
  };
  
  const getStatusBadge = () => {
    switch (getProposalField(proposal, 'status')) {
      case 'pending':
        return <Badge variant="warning">في انتظار الموافقة</Badge>;
      case 'approved':
        return <Badge variant="success">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="destructive">تم الرفض</Badge>;
      case 'selected':
        return <Badge variant="info">تم الاختيار</Badge>;
      default:
        return null;
    }
  };
  
  const isArabic = (text: string): boolean => {
    // Arabic Unicode range
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicPattern.test(text);
  };

  return (
    <Card className="overflow-hidden px-3 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(60,60,60,0.08)] hover:-translate-y-1 rounded-xl shadow-sm">
      <CardHeader className="p-4 pb-1 rtl-text">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">
            {isTeacher ? (
              <span className="font-inter">
                {getProposalField(proposal, 'student_name') || getProposalField(proposal, 'studentName')}
              </span>
            ) : (
              <span className={isArabic(projectTitle || "") ? "font-tajwal" : "font-inter"}>{projectTitle}</span>
            )}
          </CardTitle>
          <div>{getStatusBadge()}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 pb-8 rtl-text">
        <div className="flex flex-wrap items-center gap-2 mt-2 justify-start">
          <Badge variant="outline" className="flex items-center gap-1 font-medium">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2 flex-wrap">
        <div className="flex gap-2">
          {isTeacher && (
            <Button size="sm" variant="outline" onClick={() => setShowContext((v) => !v)}>
              {showContext ? 'إخفاء التفاصيل' : 'قراءة التفاصيل'}
            </Button>
          )}
          {isStudent && hasStatus('approved') && (
            <Button size="sm" onClick={handleSelect} disabled={pending}>
              اختيار كمشروع نهائي
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {isStudent && (hasStatus('pending') || hasStatus('rejected') || hasStatus('approved')) && (
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={pending}>
              حذف المقترح
            </Button>
          )}
          {isTeacher && hasStatus('pending') && !pending && (
            <>
              <Button size="sm" onClick={async () => {
                if (studentHasFinal) {
                  toast({
                    title: "تنبيه",
                    description: "لا يمكن الموافقة على هذا المقترح لأن الطالب لديه مشروع نهائي بالفعل!",
                    variant: "destructive"
                  });
                  return;
                }
                await handleApprove();
              }} disabled={pending} title={studentHasFinal ? "الطالب لديه مشروع نهائي بالفعل" : undefined}>
                موافقة
              </Button>
              <Button size="sm" variant="destructive" onClick={handleReject} disabled={pending}>
                رفض
              </Button>
            </>
          )}
        </div>
      </CardFooter>
      {isTeacher && (
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showContext ? 'opacity-100 max-h-[200px]' : 'opacity-0 max-h-0'
          }`}
        >
          <div className="p-4 pt-4 rtl-text text-right border-t text-sm text-muted-foreground bg-muted/20">
            <div className="font-bold mb-1">تفاصيل المقترح:</div>
            <div>{getProposalField(proposal, 'content') || 'لا يوجد تفاصيل.'}</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProposalCard;
