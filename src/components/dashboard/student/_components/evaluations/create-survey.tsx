"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { pb } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Star, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DiscussionSurveyDialogProps = {
  studentId: string;
  clubId: string;
  discussionId: string;
  fetchSurveys: () => Promise<void>;
  fetchDiscussions: () => Promise<void>;
};

const DiscussionSurveyDialog = ({
  studentId,
  clubId,
  fetchSurveys,
  fetchDiscussions,
  discussionId,
}: DiscussionSurveyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const client = pb();

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await client
          .collection("utils")
          .getFirstListItem('key = "surveys_student"', {
            requestKey: Math.random().toString(),
          });

        const questionsData = response.value.data || [];
        setQuestions(questionsData);
        setAnswers(new Array(questionsData.length).fill(0));
      } catch (error) {
        toast.error("حدث خطأ ما أثناء إستدعاء الأسئلة");
      }
    };

    getQuestions();
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await client.collection("surveys").create({
        type: "self-assessment",
        student_id: studentId,
        club_id: clubId,
        questions: {
          data: questions.map((q, i) => ({
            question: q,
            rating: answers[i],
          })),
        },
      });
      await client.collection("discussions").update(discussionId, {
        survey_done: true,
      });

      await fetchDiscussions();
      await fetchSurveys();
      setOpen(false);
      toast.success("تم إضافة التقييم بنجاح");
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إضافة التقييم");
    } finally {
      setIsLoading(false);
    }
  };

  const progress =
    (answers.filter((a) => a > 0).length / questions.length) * 100;

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      snapPoints={[1, 2, 3, 4, 5]}
      fadeFromIndex={0}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="w-4 h-4" />
          تقييم النقاش
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 overflow-y-auto">
          <DrawerHeader className="sticky top-0 bg-background z-10">
            <DrawerTitle className="text-xl font-bold text-center mb-4">
              تقييم نقاش الكتاب
            </DrawerTitle>
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
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pb-8">
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
                    answers[index] > 0 && "border-2 border-primary/20",
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
                          answers[index] === rating && "bg-primary/10",
                          "hover:bg-primary/5",
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={rating}
                          checked={answers[index] === rating}
                          onChange={() => {
                            const newAnswers = [...answers];
                            newAnswers[index] = rating;
                            setAnswers(newAnswers);
                          }}
                          className="sr-only"
                          required
                        />
                        <span
                          className={cn(
                            "text-2xl transition-transform group-hover:scale-110",
                            answers[index] === rating && "scale-110",
                          )}
                        >
                          {rating === 0 ? "0" : "⭐".repeat(rating)}
                        </span>
                        <span className="text-xs font-medium">
                          {rating === 0 ? "لا تقييم" : rating}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="sticky bottom-0 bg-background pt-4 pb-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || answers.some((a) => a === 0)}
              >
                {isLoading ? (
                  "جاري الحفظ..."
                ) : answers.some((a) => a === 0) ? (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    يرجى الإجابة على جميع الأسئلة
                  </span>
                ) : (
                  "حفظ التقييم"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DiscussionSurveyDialog;
