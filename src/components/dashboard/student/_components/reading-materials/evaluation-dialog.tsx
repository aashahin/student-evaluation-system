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
import { ChevronLeft, ChevronRight, Loader, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
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
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate progress
  const totalSteps = questions?.data.data.length || 0;
  const progress = ((currentStep + 1) / totalSteps) * 100;

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
        console.error("Error fetching questions:", error);
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
      setCurrentStep(0);
      setAnswers({});
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("حدث خطأ في حفظ التقييم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (!questions?.data.data[currentStep]) return false;
    return !!answers[questions.data.data[currentStep].title];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh]">
        <DialogHeader className="sticky top-0 z-10 pb-4">
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            تقييم الكتاب
          </DialogTitle>

          {!isLoading && (
            <div className="flex items-center gap-4 mb-6">
              <Progress value={progress} className="h-2" />
              <span className="text-sm font-medium whitespace-nowrap">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
          )}
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
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {questions?.data.data[currentStep] && (
                  <TypesInput
                    item={questions.data.data[currentStep]}
                    answers={answers}
                    setAnswers={setAnswers}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 0}
                className="w-full"
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                السابق
              </Button>

              {currentStep === totalSteps - 1 ? (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !canGoNext()}
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
              ) : (
                <Button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canGoNext()}
                  className="w-full"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDialog;
