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
import { Check, ChevronLeft, ChevronRight, Loader, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type CreateSurveyDialogProps = {
  studentId: string;
  clubId: string;
  fetchClubs: () => Promise<void>;
};

type Question = {
  label: string;
  questions: string[];
};

type FormattedQuestion = {
  category: string;
  question: string;
  rating: number;
};

const CreateSurveyDialog = ({
  studentId,
  clubId,
  fetchClubs,
}: CreateSurveyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formattedAnswers, setFormattedAnswers] = useState<FormattedQuestion[]>(
    [],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const client = pb();

  // Calculate progress
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await client
          .collection("utils")
          .getFirstListItem('key = "surveys_teacher"', {
            requestKey: Math.random().toString(),
          });

        // Make sure we're accessing the correct data structure
        const questionsData = response.value.data || [];

        if (Array.isArray(questionsData)) {
          setQuestions(questionsData);

          // Initialize formatted answers
          const initialAnswers: FormattedQuestion[] = [];
          questionsData.forEach((category) => {
            if (category.questions && Array.isArray(category.questions)) {
              category.questions.forEach((question: string) => {
                initialAnswers.push({
                  category: category.label,
                  question: question,
                  rating: 0,
                });
              });
            }
          });
          setFormattedAnswers(initialAnswers);
        }
      } catch (error) {
        toast.error("حدث خطأ ما أثناء إستدعاء الأسئلة");
      }
    };

    getQuestions();
  }, [client]);

  const handleRatingChange = (questionIndex: number, value: number) => {
    setFormattedAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex].rating = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await client.collection("surveys").create({
        type: "teacher-assessment",
        club_id: clubId,
        student_id: studentId,
        questions: {
          data: formattedAnswers,
        },
      });

      await fetchClubs();
      setCurrentStep(0);
      setFormattedAnswers([]);
      setOpen(false);
      toast.success("تم إضافة التقييم بنجاح.");
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إضافة التقييم.");
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = () => {
    if (!questions[currentStep]?.questions) return false;

    const startIndex = questions
      .slice(0, currentStep)
      .reduce((acc, cat) => acc + (cat.questions?.length || 0), 0);

    const endIndex = startIndex + questions[currentStep].questions.length;

    return formattedAnswers
      .slice(startIndex, endIndex)
      .every((answer) => answer.rating > 0);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      fadeFromIndex={currentStep}
      snapPoints={[1, 2, 3, 4, 5]}
    >
      <DrawerTrigger asChild>
        <Button variant="link">إضافة تقييم</Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 overflow-y-scroll">
          <DrawerHeader className="sticky top-0 bg-background z-10 pb-4">
            <DrawerTitle className="text-xl sm:text-2xl font-bold text-center mb-4">
              نموذج التقييم
            </DrawerTitle>

            {/* Add instructions */}
            <p className="text-muted-foreground text-sm text-center mb-4">
              يرجى تقييم كل سؤال على مقياس من 0 إلى 5 نجوم، حيث 5 هو الأفضل و 0
              هو الأسوأ
            </p>

            <div className="flex items-center gap-2 sm:gap-4 mb-6">
              <Progress value={progress} className="h-2" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
          </DrawerHeader>

          <div className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {questions[currentStep] && (
                    <Card className="p-4 sm:p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 sm:w-2 h-full bg-primary" />

                      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary flex items-center gap-2">
                        <span className="bg-primary text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm">
                          {currentStep + 1}
                        </span>
                        {questions[currentStep].label}
                      </h3>

                      <div className="space-y-6 sm:space-y-8">
                        {questions[currentStep].questions?.map(
                          (question, qIndex) => {
                            const globalIndex =
                              questions
                                .slice(0, currentStep)
                                .reduce(
                                  (acc, cat) =>
                                    acc + (cat.questions?.length || 0),
                                  0,
                                ) + qIndex;

                            return (
                              <div
                                key={qIndex}
                                className="bg-muted/50 p-4 sm:p-6 rounded-lg space-y-3 sm:space-y-4 hover:bg-muted/70 transition-colors"
                              >
                                <label className="block text-base sm:text-lg font-medium">
                                  {question}
                                </label>

                                <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 justify-center">
                                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                                    <label
                                      key={rating}
                                      className={`
                                        relative group flex flex-col items-center gap-1 sm:gap-2 cursor-pointer
                                        transition-all duration-200 min-w-[40px] sm:min-w-[unset]
                                        ${
                                          formattedAnswers[globalIndex]
                                            ?.rating === rating
                                            ? "scale-110 text-primary"
                                            : "hover:text-primary/80"
                                        }
                                      `}
                                      title={
                                        rating === 0
                                          ? "غير مرضي تماماً"
                                          : rating === 1
                                            ? "ضعيف جداً"
                                            : rating === 2
                                              ? "ضعيف"
                                              : rating === 3
                                                ? "متوسط"
                                                : rating === 4
                                                  ? "جيد"
                                                  : "ممتاز"
                                      }
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${globalIndex}`}
                                        value={rating}
                                        checked={
                                          formattedAnswers[globalIndex]
                                            ?.rating === rating
                                        }
                                        onChange={() =>
                                          handleRatingChange(
                                            globalIndex,
                                            rating,
                                          )
                                        }
                                        className="sr-only"
                                        required
                                      />
                                      <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-110">
                                        {rating === 0
                                          ? "0"
                                          : "⭐".repeat(rating)}
                                      </span>
                                      <span className="text-xs sm:text-sm font-medium">
                                        {rating}
                                      </span>
                                      {formattedAnswers[globalIndex]?.rating ===
                                        rating && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 sm:p-1"
                                        >
                                          <Check className="w-2 h-2 sm:w-3 sm:h-3" />
                                        </motion.div>
                                      )}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  disabled={currentStep === 0}
                  className="w-full"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">السابق</span>
                </Button>

                {currentStep === totalSteps - 1 ? (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !canGoNext()}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="text-sm sm:text-base">
                          جاري الحفظ...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">
                          حفظ التقييم
                        </span>
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
                    <span className="text-sm sm:text-base">التالي</span>
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateSurveyDialog;
