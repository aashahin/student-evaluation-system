import { Survey, SurveyType } from "@/types/api";

export const surveyTypeLabels: Record<SurveyType, string> = {
  "self-assessment": "تقييم ذاتي",
  "teacher-assessment": "تقييم المعلم",
  "parent-assessment": "تقييم ولي الأمر",
};

export const surveyTypeStyles: Record<SurveyType, string> = {
  "self-assessment": "bg-violet-50 text-violet-700 border-violet-200",
  "teacher-assessment": "bg-blue-50 text-blue-700 border-blue-200",
  "parent-assessment": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const surveyTypeColors: Record<
  SurveyType,
  { bg: string; text: string }
> = {
  "self-assessment": { bg: "bg-violet-500", text: "text-violet-500" },
  "teacher-assessment": { bg: "bg-blue-500", text: "text-blue-500" },
  "parent-assessment": { bg: "bg-emerald-500", text: "text-emerald-500" },
};

export type StatsData = {
  totalAvg: number;
  typeCount: Record<SurveyType, number>;
  monthlyProgress: Record<string, { count: number; total: number }>;
};
