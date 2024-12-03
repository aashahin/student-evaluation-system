"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { pb } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ParentSurveyDialogProps = {
  studentId: string;
  clubId: string;
  fetchSurveys: () => Promise<void>;
};

type Question = string;

type FormattedQuestion = {
  question: string;
  rating: number;
};

const ParentSurveyDialog = ({
  studentId,
  fetchSurveys,
  clubId,
}: ParentSurveyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formattedAnswers, setFormattedAnswers] = useState<FormattedQuestion[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const client = pb();

  const progress =
    (formattedAnswers.filter((a) => a.rating > 0).length / questions.length) *
    100;

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await client
          .collection("utils")
          .getFirstListItem('key = "survey_parent"', {
            requestKey: Math.random().toString(),
          });

        const questionsData = response.value.data || [];
        if (Array.isArray(questionsData)) {
          setQuestions(questionsData);
          const initialAnswers: FormattedQuestion[] = questionsData.map(
            (question) => ({
              question,
              rating: 0,
            }),
          );
          setFormattedAnswers(initialAnswers);
        }
      } catch (error) {
        toast.error("حدث خطأ أثناء الحصول على الأسئلة");
      }
    };

    if (open) {
      getQuestions();
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formattedAnswers.some((answer) => answer.rating === 0)) {
      toast.error("يرجى الإجابة على جميع الأسئلة");
      return;
    }

    try {
      setIsLoading(true);
      await client.collection("surveys").create({
        type: "parent-assessment",
        student_id: studentId,
        club_id: clubId,
        questions: {
          data: formattedAnswers,
        },
      });

      toast.success("تم إرسال التقييم بنجاح");
      setOpen(false);
      setFormattedAnswers([]);
      await fetchSurveys();
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال التقييم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 me-1">
          تقييم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl min-h-screen sm:h-[90vh] flex flex-col">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-bold text-center mb-4">
            تقييم مهارات الطالب
          </DialogTitle>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-muted-foreground text-sm text-center">
              {progress === 100 ? (
                <span className="text-green-500">
                  تم الإجابة على جميع الأسئلة
                </span>
              ) : (
                `تم الإجابة على ${Math.round(progress)}% من الأسئلة`
              )}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <AnimatePresence mode="wait">
              {questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "bg-muted/50 p-6 rounded-lg space-y-4 hover:bg-muted/70 transition-all",
                    formattedAnswers[index]?.rating > 0 &&
                      "border-2 border-primary/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <label className="block text-base font-medium leading-relaxed">
                      {question}
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <label
                        key={rating}
                        className={cn(
                          "relative group flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 min-w-[50px] p-2 rounded-lg",
                          formattedAnswers[index]?.rating === rating &&
                            "bg-primary/10",
                          "hover:bg-primary/5",
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={rating}
                          checked={formattedAnswers[index]?.rating === rating}
                          onChange={() => {
                            const newAnswers = [...formattedAnswers];
                            newAnswers[index] = {
                              ...newAnswers[index],
                              rating: rating,
                            };
                            setFormattedAnswers(newAnswers);
                          }}
                          className="sr-only"
                          required
                        />
                        <span
                          className={cn(
                            "text-lg font-semibold transition-transform group-hover:scale-110",
                            formattedAnswers[index]?.rating === rating &&
                              "scale-110",
                          )}
                        >
                          {rating === 0 ? "-" : rating}
                        </span>
                        <span className="text-xs font-medium">
                          {rating === 0 ? "لا تقييم" : "تقييم"}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="sticky bottom-0 bg-background pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || formattedAnswers.some((a) => a.rating === 0)
                }
              >
                {isLoading ? (
                  "جاري الحفظ..."
                ) : formattedAnswers.some((a) => a.rating === 0) ? (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    يرجى تقييم جميع المهارات
                  </span>
                ) : (
                  "حفظ التقييم"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentSurveyDialog;
