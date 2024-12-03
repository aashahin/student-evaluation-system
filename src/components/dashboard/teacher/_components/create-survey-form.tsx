import React, { useState } from "react";
import PocketBase from "pocketbase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  FormattedQuestion,
  Question,
} from "@/components/dashboard/teacher/_components/create-survey-dialog";

type CreateSurveyFormProps = {
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
};

const CreateSurveyForm = ({
  setFormattedAnswers,
  client,
  formattedAnswers,
  clubId,
  studentId,
  setOpen,
  questions,
  fetchClubs,
}: CreateSurveyFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formattedAnswers.every((answer) => answer.rating > 0)) {
      toast.error("يرجى تقييم جميع الأسئلة");
      return;
    }

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
      // Reset all states
      setFormattedAnswers(
        questions.flatMap((category) =>
          category.questions.map((question) => ({
            category: category.label,
            question,
            rating: 0,
          })),
        ),
      );
      setOpen(false);
      toast.success("تم إضافة التقييم بنجاح.");
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إضافة التقييم.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <AnimatePresence mode="sync">
        {questions.map((category, categoryIndex) => (
          <React.Fragment key={categoryIndex}>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="font-semibold text-lg mb-4"
            >
              {category.label}
            </motion.h3>
            {category.questions.map((question, questionIndex) => {
              const globalIndex =
                questions
                  .slice(0, categoryIndex)
                  .reduce((acc, cat) => acc + cat.questions.length, 0) +
                questionIndex;

              return (
                <motion.div
                  key={`${categoryIndex}-${questionIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "bg-muted/50 p-6 rounded-lg space-y-4 hover:bg-muted/70 transition-all",
                    formattedAnswers[globalIndex]?.rating > 0 &&
                      "border-2 border-primary/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-medium">
                      {globalIndex + 1}
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
                          formattedAnswers[globalIndex]?.rating === rating &&
                            "bg-primary/10",
                          "hover:bg-primary/5",
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${globalIndex}`}
                          value={rating}
                          checked={
                            formattedAnswers[globalIndex]?.rating === rating
                          }
                          onChange={() => {
                            const newAnswers = [...formattedAnswers];
                            newAnswers[globalIndex] = {
                              ...newAnswers[globalIndex],
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
                            formattedAnswers[globalIndex]?.rating === rating &&
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
              );
            })}
          </React.Fragment>
        ))}
      </AnimatePresence>

      <div className="sticky bottom-0 bg-background pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || formattedAnswers.some((a) => a.rating === 0)}
        >
          {isLoading ? "جاري الإرسال..." : "إرسال التقييم"}
        </Button>
      </div>
    </form>
  );
};

export default CreateSurveyForm;
