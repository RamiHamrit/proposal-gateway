import { useState } from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createProposal, getProposalsByUserId } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

interface ProposalFormProps {
  project: Project;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProposalForm = ({ project, onSubmit, onCancel }: ProposalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Utility to check if the user has already selected a final project
  async function hasSelectedProposal(userId: string) {
    const proposals = await getProposalsByUserId(userId);
    // Check for a proposal with status 'selected' if status exists, otherwise fallback to count
    return proposals.some(p => (p.status ? p.status === 'selected' : false));
  }

  // Utility to check if the user was rejected for this project
  async function wasRejectedForProject(userId: string, projectId: string) {
    const proposals = await getProposalsByUserId(userId);
    // If you have a status field, check for 'rejected' status
    return proposals.some(p => p.project_id === projectId && (p.status ? p.status === 'rejected' : false));
  }

  // Utility to check if the project is selected by any student
  async function isProjectSelectedByAnyStudent(projectId: string) {
    const res = await import("@/utils/api");
    const proposals = await res.getProposalsByProjectId(projectId);
    return proposals.some(p => (p.status ? p.status === 'selected' : false));
  }

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

    // Check if student has already selected a final project
    if (await hasSelectedProposal(user.id)) {
      toast({
        title: "غير مسموح",
        description: "لديك مشروع نهائي مختار بالفعل، لا يمكنك التقديم لمشاريع جديدة",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    // Check if student was previously rejected for this project (even if deleted)
    if (await wasRejectedForProject(user.id, project.id)) {
      toast({
        title: "غير مسموح",
        description: "تم رفض مقترحك لهذا المشروع مسبقًا، لا يمكنك التقديم مرة أخرى",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    // Check if the project is already selected by another student
    if (await isProjectSelectedByAnyStudent(project.id)) {
      toast({
        title: "غير متاح",
        description: "هذا المشروع محجوز بالفعل من طالب آخر",
        variant: "destructive",
      });
      onCancel();
      return;
    }

    if (!content.trim()) {
      toast({
        title: "المحتوى مطلوب",
        description: "يرجى إدخال محتوى المقترح.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProposal(project.id, user.id, content);
      toast({
        title: "تم تقديم المقترح",
        description: "تم تقديم مقترحك بنجاح وهو الآن قيد المراجعة",
      });
      onSubmit();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء تقديم المقترح",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onCancel();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="rtl-text">تقديم مقترح للمشروع</DialogTitle>
          <DialogDescription className="rtl-text">
            هل أنت متأكد من رغبتك في تقديم مقترح لمشروع "{project.name}"؟
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground rtl-text">
            بتقديمك لهذا المقترح، سيتمكن الأستاذ {project.teacher_name} من مراجعة طلبك والموافقة عليه أو رفضه. يمكنك تقديم مقترحات لما يصل إلى 3 مشاريع.
          </p>
          <textarea
            className="w-full border rounded p-2 mt-2"
            rows={5}
            placeholder="اكتب محتوى المقترح هنا..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>

        <DialogFooter className="ltr-buttons">
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
