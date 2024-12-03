import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Survey, User } from "@/types/api";
import { CalendarIcon, ClipboardIcon } from "lucide-react";

const RatingDisplay = ({ rating }: { rating: number }) => {
  const getColorClass = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 3.5) return "bg-blue-500";
    if (rating >= 2.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${getColorClass(
          rating,
        )} text-white rounded-full w-8 h-8 flex items-center justify-center font-medium`}
        title={`التقييم: ${rating} من 5`}
      >
        {rating.toFixed(1)}
      </div>
      <span className="text-sm text-gray-500">من 5</span>
    </div>
  );
};

// Reusable Survey Card Component
const SurveyCard = ({ survey }: { survey: Survey }) => {
  const avgRating =
    survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
    survey.questions.data.length;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          {new Date(survey.created).toLocaleDateString("ar")}
        </div>
        <RatingDisplay rating={avgRating} />
      </div>

      <div className="space-y-4">
        {survey.questions.data.map((question, idx) => (
          <div key={idx} className="border-b pb-3 last:border-b-0 last:pb-0">
            <p className="text-gray-700 mb-2 font-medium">
              {question.question}
            </p>
            <RatingDisplay rating={question.rating} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Empty State Component
const EmptySurveyState = () => (
  <div className="text-center py-8">
    <ClipboardIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
    <h3 className="text-gray-700 font-medium">لا توجد تقييمات</h3>
    <p className="text-sm text-gray-500 mt-1">لم يتم إضافة أي تقييمات بعد</p>
  </div>
);

// Main Survey Dialog Component
const SurveyDialog = ({
  trigger,
  surveys,
  title,
}: {
  trigger: React.ReactNode;
  surveys: Survey[];
  title: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl min-h-screen sm:min-h-[80vh] scrollarea">
        <DialogTitle>{title}</DialogTitle>

        {surveys.length > 0 && (
          <span className="bg-gray-50 px-4 py-2 rounded-lg mb-4 text-sm">
            المعدل العام:{" "}
            {(
              surveys.reduce((acc, survey) => {
                const surveyAvg =
                  survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
                  survey.questions.data.length;
                return acc + surveyAvg;
              }, 0) / surveys.length
            ).toFixed(1)}
          </span>
        )}

        <div className="overflow-y-auto flex-1 pr-2">
          <div className="space-y-4">
            {surveys.length > 0 ? (
              surveys.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} />
              ))
            ) : (
              <EmptySurveyState />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const SurveysDetailsDialog = ({ survey }: { survey: Survey }) => (
  <SurveyDialog
    trigger={<Button variant="link">عرض التفاصيل</Button>}
    surveys={[survey]}
    title="تفاصيل التقييم"
  />
);

export const SurveysTeacherDetailsDialog = ({
  member,
  memberSurveys,
}: {
  member: User;
  memberSurveys: Record<string, Survey[]>;
}) => (
  <SurveyDialog
    trigger={
      <Button variant="link" className="flex items-center gap-2">
        <span>{memberSurveys[member.id]?.length ?? 0}</span>
        <span>تقييم</span>
      </Button>
    }
    surveys={memberSurveys[member.id] ?? []}
    title={`تقييمات الطالب: ${member.name}`}
  />
);
