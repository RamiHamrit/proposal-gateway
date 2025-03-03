
import { Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { updateProposalStatus, deleteProposal } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface ProposalCardProps {
  proposal: Proposal;
  projectTitle?: string;
  onStatusChange?: () => void;
}

const ProposalCard = ({ 
  proposal, 
  projectTitle,
  onStatusChange 
}: ProposalCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  
  // Format date in Arabic
  const formattedDate = formatDistanceToNow(new Date(proposal.createdAt), {
    addSuffix: true,
    locale: arSA
  });
  
  const handleApprove = () => {
    updateProposalStatus(proposal.id, 'approved');
    toast({
      title: "تمت الموافقة",
      description: "تمت الموافقة على مقترح الطالب",
    });
    if (onStatusChange) onStatusChange();
  };
  
  const handleReject = () => {
    updateProposalStatus(proposal.id, 'rejected');
    toast({
      title: "تم الرفض",
      description: "تم رفض مقترح الطالب",
    });
    if (onStatusChange) onStatusChange();
  };
  
  const handleSelect = () => {
    updateProposalStatus(proposal.id, 'selected');
    toast({
      title: "تم الاختيار",
      description: "تم اختيار هذا المشروع كمشروعك النهائي",
    });
    if (onStatusChange) onStatusChange();
  };
  
  const handleDelete = () => {
    deleteProposal(proposal.id);
    toast({
      title: "تم الحذف",
      description: "تم حذف المقترح بنجاح",
    });
    if (onStatusChange) onStatusChange();
  };
  
  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">في انتظار الموافقة</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">تم الرفض</Badge>;
      case 'selected':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">تم الاختيار</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`card-hover ${proposal.status === 'rejected' ? 'opacity-70' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">
            {isTeacher ? proposal.studentName : projectTitle}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isTeacher && <User size={14} />}
          {isStudent && projectTitle && <span>المشروع: {projectTitle}</span>}
          <Clock size={14} className="mr-2" />
          <span>{formattedDate}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        {isTeacher && proposal.status === 'pending' && (
          <>
            <Button size="sm" onClick={handleApprove}>
              موافقة
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReject}>
              رفض
            </Button>
          </>
        )}
        
        {isStudent && proposal.status === 'approved' && (
          <Button size="sm" onClick={handleSelect}>
            اختيار كمشروع نهائي
          </Button>
        )}
        
        {isStudent && proposal.status === 'pending' && (
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            حذف المقترح
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProposalCard;
