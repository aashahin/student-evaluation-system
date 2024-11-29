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

          <CreateSurveyForm
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            setFormattedAnswers={setFormattedAnswers}
            client={client}
            formattedAnswers={formattedAnswers}
            clubId={clubId}
            studentId={studentId}
            setOpen={setOpen}
            questions={questions}
            fetchClubs={fetchClubs}
            totalSteps={totalSteps}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateSurveyDialog;
