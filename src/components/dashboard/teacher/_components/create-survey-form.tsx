import React, { useState } from "react";
import PocketBase from "pocketbase";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormattedQuestion,
  Question,
} from "@/components/dashboard/teacher/_components/create-survey-dialog";

type CreateSurveyFormProps = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setFormattedAnswers: React.Dispatch<
    React.SetStateAction<FormattedQuestion[]>
  >;
  client: PocketBase;
  formattedAnswers: FormattedQuestion[];
  clubId: string;
  studentId: string;
  setOpen: (open: boolean) => void;
  questions: Question[];
  fetchClubs: () => Promise<void>;
  totalSteps: number;
};

const CreateSurveyForm = ({
  currentStep,
  setCurrentStep,
  setFormattedAnswers,
  client,
  formattedAnswers,
  clubId,
  studentId,
  setOpen,
  questions,
  fetchClubs,
  totalSteps,
}: CreateSurveyFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
              <div className="p-4 sm:p-6 relative overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                <div className="absolute top-0 left-0 w-1 sm:w-2 h-full bg-primary" />

                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary flex items-center gap-2">
                  <span className="bg-primary text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm">
                    {currentStep + 1}
                  </span>
                  {questions[currentStep].label}
                </h3>

                <div className="space-y-6 sm:space-y-8">
                  {questions[currentStep].questions?.map((question, qIndex) => {
                    const globalIndex =
                      questions
                        .slice(0, currentStep)
                        .reduce(
                          (acc, cat) => acc + (cat.questions?.length || 0),
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
                                  formattedAnswers[globalIndex]?.rating ===
                                  rating
                                }
                                onChange={() =>
                                  handleRatingChange(globalIndex, rating)
                                }
                                className="sr-only"
                                required
                              />
                              <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-110">
                                {rating === 0 ? "0" : "⭐".repeat(rating)}
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
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-2 sm:gap-4 mt-4 sm:mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
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
                  <span className="text-sm sm:text-base">جاري الحفظ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">حفظ التقييم</span>
                </div>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))
              }
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
  );
};

export default CreateSurveyForm;
