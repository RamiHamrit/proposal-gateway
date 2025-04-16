import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createProject } from "@/utils/projectApi.supabase";
import { useAuth } from "@/context/AuthContext";

interface NewProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const NewProjectForm = ({ open, onOpenChange, onProjectCreated }: NewProjectFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!user || user.role !== "teacher") {
      toast({
        title: "غير مصرح",
        description: "يجب تسجيل الدخول كأستاذ لإنشاء مشروع",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject(name, description, user.id, user.name); // user.name if you added teacher_name
      toast({
        title: "تم إنشاء المشروع",
        description: "تم إنشاء المشروع الجديد بنجاح",
      });
      setName("");
      setDescription("");
      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء المشروع",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة مشروع جديد</DialogTitle>
          <DialogDescription>يرجى ملء جميع الحقول لإنشاء مشروع جديد</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم المشروع</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم المشروع"
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصفًا تفصيليًا للمشروع"
                className="col-span-3 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectForm;