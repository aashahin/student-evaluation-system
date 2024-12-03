import { Card, CardContent } from "@/components/ui/card";
import { Survey } from "@/types/api";
import { CalendarIcon, StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { surveyTypeLabels, surveyTypeStyles } from "./types";

type SurveyListProps = {
  surveys: Survey[];
};

export const SurveyList = ({
  surveys = [],
}: SurveyListProps) => {
  if (surveys.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 mb-2">
            لا يوجد تقييمات
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {surveys.map((survey) => {
        const averageRating = (
          survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
          survey.questions.data.length
        ).toFixed(1);

        return (
          <Card
            key={survey.id}
            className="hover:shadow transition-all duration-200 group"
          >
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-transform group-hover:scale-105",
                      surveyTypeStyles[survey.type],
                    )}
                  >
                    {surveyTypeLabels[survey.type]}
                  </span>
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-yellow-700">
                      {averageRating}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    {new Date(survey.created).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
