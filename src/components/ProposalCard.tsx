import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Proposal } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateProposalStatus, deleteProposal } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface ProposalCardProps {
  proposal: Proposal;
  projectTitle: string;
  onStatusChange: () => void;
  className?: string;
}

const getStatusText = (status: Proposal['status']) => {
  switch (status) {
    case 'pending':
      return 'قيد الانتظار';
    case 'approved':
      return 'موافق عليه';
    case 'rejected':
      return 'مرفوض';
    case 'selected':
      return 'تم اختياره';
    default:
      return 'غير معروف';
  }
};

const getStatusVariant = (status: Proposal['status']) => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'selected':
      return 'default';
    default:
      return 'default';
  }
};

const ProposalCard = ({ proposal, projectTitle, onStatusChange, className }: ProposalCardProps) => {
  const { toast } = useToast();

  const handleStatusChange = (status: Proposal['status']) => {
    updateProposalStatus(proposal.id, status);
    onStatusChange();
    toast({
      title: "تم تحديث الحالة",
      description: `تم تحديث حالة المقترح إلى ${getStatusText(status)}`,
    });
  };

  const handleDeleteProposal = () => {
    deleteProposal(proposal.id);
    onStatusChange();
    toast({
      title: "تم حذف المقترح",
      description: "تم حذف المقترح بنجاح",
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{projectTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p>الحالة:</p>
            <Badge variant={getStatusVariant(proposal.status)}>
              {getStatusText(proposal.status)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>{formatDate(proposal.createdAt)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {proposal.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleStatusChange('approved')}>
              قبول
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange('rejected')}>
              رفض
            </Button>
          </div>
        )}
        
        {proposal.status === 'approved' && (
          <Button size="sm" onClick={() => handleStatusChange('selected')}>
            تحديد
          </Button>
        )}
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={proposal.status === 'selected'}>
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذا المقترح بشكل دائم ولا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProposal}>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default ProposalCard;
