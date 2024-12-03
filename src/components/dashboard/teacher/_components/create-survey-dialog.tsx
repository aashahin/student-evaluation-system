"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pb } from "@/lib/api";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import CreateSurveyForm from "./create-survey-form";

type CreateSurveyDialogProps = {
  studentId: string;
  clubId: string;
  fetchClubs: () => Promise<void>;
};

export type Question = {
  label: string;
  questions: string[];
};

export type FormattedQuestion = {
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formattedAnswers, setFormattedAnswers] = useState<FormattedQuestion[]>(
    [],
  );
  const client = pb();

  const resetForm = () => {
    setFormattedAnswers([]);
    if (questions.length > 0) {
      const initialAnswers: FormattedQuestion[] = [];
      questions.forEach((category: Question) => {
        if (
          category?.label &&
          category?.questions &&
          Array.isArray(category.questions)
        ) {
          category.questions.forEach((question: string) => {
            if (question) {
              initialAnswers.push({
                category: category.label,
                question: question,
                rating: 0,
              });
            }
          });
        }
      });
      setFormattedAnswers(initialAnswers);
    }
  };

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await client
          .collection("utils")
          .getFirstListItem('key = "surveys_teacher"', {
            requestKey: Math.random().toString(),
          });

        const questionsData = response.value?.data || [];

        if (Array.isArray(questionsData)) {
          setQuestions(questionsData);

          const initialAnswers: FormattedQuestion[] = [];
          questionsData.forEach((category: Question) => {
            if (
              category?.label &&
              category?.questions &&
              Array.isArray(category.questions)
            ) {
              category.questions.forEach((question: string) => {
                if (question) {
                  initialAnswers.push({
                    category: category.label,
                    question: question,
                    rating: 0,
                  });
                }
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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm();
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          تقييم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl min-h-screen sm:h-[90vh] flex flex-col">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-bold text-center mb-4">
            تقييم الطالب
          </DialogTitle>
          <div className="space-y-2">
            <Progress
              value={
                (formattedAnswers.filter((a) => a.rating > 0).length /
                  formattedAnswers.length) *
                100
              }
              className="h-2"
            />
            <p className="text-muted-foreground text-sm text-center">
              {formattedAnswers.every((a) => a.rating > 0) ? (
                <span className="text-green-500">
                  تم الإجابة على جميع الأسئلة
                </span>
              ) : (
                `تم الإجابة على ${Math.round((formattedAnswers.filter((a) => a.rating > 0).length / formattedAnswers.length) * 100)}% من الأسئلة`
              )}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <CreateSurveyForm
            formattedAnswers={formattedAnswers}
            setFormattedAnswers={setFormattedAnswers}
            client={client}
            clubId={clubId}
            studentId={studentId}
            setOpen={setOpen}
            questions={questions}
            fetchClubs={fetchClubs}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSurveyDialog;
