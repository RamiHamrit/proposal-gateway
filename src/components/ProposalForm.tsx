
import { useState } from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createProposal } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

interface ProposalFormProps {
  project: Project;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProposalForm = ({ project, onSubmit, onCancel }: ProposalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubmit = async () => {
    if (!user || user.role !== 'student') {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول كطالب لتقديم مقترح",
        variant: "destructive",
      });
      onCancel();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = createProposal(project.id, user.id, user.name);
      
      if (result) {
        toast({
          title: "تم تقديم المقترح",
          description: "تم تقديم مقترحك بنجاح وهو الآن قيد المراجعة",
        });
        onSubmit();
      } else {
        toast({
          title: "لم يتم تقديم المقترح",
          description: "لقد وصلت إلى الحد الأقصى من المقترحات أو قدمت مقترحًا لهذا المشروع بالفعل",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تقديم المقترح",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تقديم مقترح للمشروع</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في تقديم مقترح لمشروع "{project.title}"؟
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            بتقديمك لهذا المقترح، سيتمكن الأستاذ {project.teacherName} من مراجعة طلبك والموافقة عليه أو رفضه. يمكنك تقديم مقترحات لما يصل إلى 3 مشاريع.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري التقديم..." : "تقديم المقترح"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalForm;
