import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EvaluationBookCard } from "@/types/api";
import PocketBase from "pocketbase";
import { Loader, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { TypesInput } from "@/components/dashboard/student/_components/reading-materials/evaluation-dialog-types";

type EvaluationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  studentId: string;
  gradeLevel: string;
  client: PocketBase;
};

const EvaluationDialog = ({
  open,
  onOpenChange,
  bookId,
  studentId,
  gradeLevel,
  client,
}: EvaluationDialogProps) => {
  const [questions, setQuestions] = useState<EvaluationBookCard | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await client
          .collection("evaluations_book_cards")
          .getFirstListItem<EvaluationBookCard>(
            `grade_level = "${gradeLevel}"`,
          );
        setQuestions(response);
      } catch (error) {
        toast.error("حدث خطأ في تحميل الأسئلة");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchQuestions();
    }
  }, [open, gradeLevel, client]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all questions are answered
    const totalQuestions = questions?.data.data.length || 0;
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions < totalQuestions) {
      toast.error("الرجاء الإجابة على جميع الأسئلة");
      return;
    }

    setIsSubmitting(true);

    try {
      await client.collection("evaluations_books").create({
        book_id: bookId,
        student_id: studentId,
        evaluation: {
          data: Object.entries(answers).map(([question, answer]) => ({
            question,
            answer,
          })),
        },
      });

      toast.success("تم حفظ التقييم بنجاح");
      onOpenChange(false);
      setAnswers({});
    } catch (error) {
      toast.error("حدث خطأ في حفظ التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-screen sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            تقييم الكتاب
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            onKeyDown={handleKeyDown}
          >
            <div className="space-y-6">
              {questions?.data.data.map((item, index) => (
                <TypesInput
                  key={index}
                  item={item}
                  answers={answers}
                  setAnswers={setAnswers}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  حفظ التقييم
                </div>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDialog;
