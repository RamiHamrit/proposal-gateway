import { Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { updateProposalStatus, deleteProposal, getProposalsByProjectId } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProposalCardProps {
  proposal: Proposal;
  projectTitle?: string;
  onStatusChange?: () => void;
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

  const handleApprove = async () => {
    setPending(true);
    try {
      // Check if there are already approved proposals for this project
      const projectProposals = await getProposalsByProjectId(getProposalField(proposal, 'project_id') || getProposalField(proposal, 'projectId'));
      const hasApprovedProposal = projectProposals.some(
        p => (p.status === 'approved' || p.status === 'selected') && p.id !== getProposalField(proposal, 'id')
      );
      if (hasApprovedProposal) {
        toast({
          title: "لا يمكن الموافقة",
          description: "تم بالفعل الموافقة على مقترح آخر لهذا المشروع",
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
      if (onStatusChange) await onStatusChange();
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
      if (onStatusChange) await onStatusChange();
    } finally {
      setPending(false);
    }
  };
  
  const handleSelect = async () => {
    await updateProposalStatus(getProposalField(proposal, 'id'), 'selected');
    toast({
      title: "تم الاختيار",
      description: "تم اختيار هذا المشروع كمشروعك النهائي",
    });
    if (onStatusChange) await onStatusChange();
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
    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <CardHeader className="p-4 rtl-text">
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
      
      <CardContent className="p-4 pt-0 rtl-text">
        <div className="flex flex-wrap items-center gap-2 mt-2 justify-end">
          <Badge variant="outline" className="flex items-center gap-1 font-medium">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2 flex-wrap">
        <div>
          {isStudent && (hasStatus('pending') || hasStatus('rejected')) && (
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={pending}>
              حذف المقترح
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {isTeacher && (
            <Button size="sm" variant="outline" onClick={() => setShowContext((v) => !v)}>
              {showContext ? 'إخفاء التفاصيل' : 'قراءة التفاصيل'}
            </Button>
          )}
          {isTeacher && hasStatus('pending') && !pending && (
            <>
              <Button size="sm" onClick={handleApprove} disabled={pending}>
                موافقة
              </Button>
              <Button size="sm" variant="destructive" onClick={handleReject} disabled={pending}>
                رفض
              </Button>
            </>
          )}
          {isStudent && hasStatus('approved') && (
            <Button size="sm" onClick={handleSelect} disabled={pending}>
              اختيار كمشروع نهائي
            </Button>
          )}
        </div>
      </CardFooter>
      {isTeacher && showContext && (
        <div className="p-4 pt-0 rtl-text text-right border-t text-sm text-muted-foreground bg-muted/20">
          <div className="font-bold mb-1">تفاصيل المقترح:</div>
          <div>{getProposalField(proposal, 'content') || 'لا يوجد تفاصيل.'}</div>
        </div>
      )}
    </Card>
  );
};

export default ProposalCard;
