
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createProject } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NewProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const NewProjectForm = ({ 
  open, 
  onOpenChange, 
  onProjectCreated 
}: NewProjectFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || user.role !== 'teacher') {
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
      // Create project in local storage
      createProject(title, description, user.id, user.name);
      
      // Also try to create project in Supabase if we have a connection
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            title,
            description,
            teacher_id: user.id
          })
          .select()
          .single();
          
        if (projectError) {
          console.error("Error creating project in Supabase:", projectError);
          // Continue with local storage project only
        } else {
          console.log("Project created in Supabase:", projectData);
        }
      } catch (dbError) {
        console.error("Failed to create project in database:", dbError);
        // Project is still created in local storage, so we continue
      }
      
      toast({
        title: "تم إنشاء المشروع",
        description: "تم إنشاء المشروع الجديد بنجاح",
      });
      
      setTitle("");
      setDescription("");
      onOpenChange(false);
      onProjectCreated();
    } catch (error) {
      console.error("Project creation error:", error);
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
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
          <DialogDescription>
            أضف تفاصيل المشروع الجديد ليتمكن الطلاب من تقديم مقترحاتهم.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">عنوان المشروع</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المشروع"
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
