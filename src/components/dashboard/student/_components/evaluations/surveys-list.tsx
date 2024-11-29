import { CalendarIcon, ClipboardIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SurveyDetails from "@/components/dashboard/_components/survey-details";
import React from "react";
import { Survey, SurveyType } from "@/types/api";

const SurveysList = ({
  isLoading,
  surveys,
  surveyTypeLabels,
  surveyTypeStyles,
}: {
  isLoading: boolean;
  surveys: Survey[];
  surveyTypeLabels: Record<SurveyType, string>;
  surveyTypeStyles: Record<SurveyType, string>;
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-50 text-green-600 border-green-200";
    if (rating >= 3) return "bg-blue-50 text-blue-600 border-blue-200";
    if (rating >= 2) return "bg-yellow-50 text-yellow-600 border-yellow-200";
    return "bg-red-50 text-red-600 border-red-200";
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold">قائمة التقييمات</h2>
      </div>

      <div
        className="divide-y divide-gray-100 scrollarea"
        style={{ maxHeight: "400px" }}
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل التقييمات...</p>
          </div>
        ) : surveys.length > 0 ? (
          surveys.map((survey) => {
            const avgRating =
              survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
              survey.questions.data.length;

            return (
              <div
                key={survey.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                        surveyTypeStyles[survey.type]
                      }`}
                    >
                      {surveyTypeLabels[survey.type]}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getRatingColor(
                        avgRating,
                      )}`}
                    >
                      {avgRating.toFixed(1)}/5
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(survey.created).toLocaleDateString("ar-SA")}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="min-w-[120px]">
                        عرض التفاصيل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-50 max-w-3xl w-[95vw]">
                      <DialogTitle className="flex items-center gap-2">
                        <span>تفاصيل التقييم</span>
                        <span
                          className={`text-sm px-3 py-1 rounded-full border ${
                            surveyTypeStyles[survey.type]
                          }`}
                        >
                          {surveyTypeLabels[survey.type]}
                        </span>
                      </DialogTitle>
                      <div className="mt-2 border-t border-gray-200" />
                      <SurveyDetails survey={survey} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              لا توجد تقييمات
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              لم يتم إضافة أي تقييمات لك بعد
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveysList;
