import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SurveyDetails from "@/components/dashboard/_components/survey-details";
import { Survey, User } from "@/types/api";
import { CalendarIcon, ClipboardIcon } from "lucide-react";

type SurveyDetailsDialogProps = {
  openSurveyDetails: boolean;
  setOpenSurveyDetails: (open: boolean) => void;
  selectedSurvey: Survey | null;
  setSelectedSurvey: (survey: Survey | null) => void;
  survey: Survey;
};

const SurveysDetailsDialog = ({
  openSurveyDetails,
  setOpenSurveyDetails,
  selectedSurvey,
  setSelectedSurvey,
  survey,
}: SurveyDetailsDialogProps) => {
  return (
    <Dialog
      open={openSurveyDetails && selectedSurvey?.id === survey.id}
      onOpenChange={(open) => {
        setOpenSurveyDetails(open);
        if (open) {
          setSelectedSurvey(survey);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="link">عرض التفاصيل</Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-50">
        <DialogTitle>تفاصيل التقييم</DialogTitle>
        <div className="mt-2 border-t border-gray-300" />
        <SurveyDetails survey={survey} />
      </DialogContent>
    </Dialog>
  );
};

type SurveyTeacherDetailsDialogProps = {
  openTeacherSurveys: boolean;
  setOpenTeacherSurveys: (open: boolean) => void;
  selectedMember: User | null;
  setSelectedMember: (member: User | null) => void;
  member: User;
  memberSurveys: Record<string, Survey[]>;
};

const SurveysTeacherDetailsDialog = ({
  openTeacherSurveys,
  setOpenTeacherSurveys,
  selectedMember,
  setSelectedMember,
  member,
  memberSurveys,
}: SurveyTeacherDetailsDialogProps) => {
  return (
    <Dialog
      open={openTeacherSurveys && selectedMember?.id === member.id}
      onOpenChange={(open) => {
        setOpenTeacherSurveys(open);
        if (open) setSelectedMember(member);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="hover:text-blue-600 transition-colors duration-200 group flex items-center gap-2 mx-auto"
        >
          <span className="font-medium">
            {memberSurveys[member.id]?.length ?? 0}
          </span>
          <span className="group-hover:underline">تقييم</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-50 w-[95vw] md:max-w-[40rem] max-h-[90vh] p-4 sm:p-6 rounded-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-semibold mb-4">
              تقييمات الطالب: {member.name}
            </DialogTitle>

            {/* Stats & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-blue-50 px-4 py-2 rounded-full transition-all hover:bg-blue-100">
                  <span className="text-sm font-medium text-blue-700">
                    {memberSurveys[member.id]?.length ?? 0} تقييم
                  </span>
                </div>
                {memberSurveys[member.id]?.length > 0 && (
                  <div className="bg-purple-50 px-4 py-2 rounded-full transition-all hover:bg-purple-100">
                    <span className="text-sm font-medium text-purple-700">
                      معدل التقييم:{" "}
                      {(
                        memberSurveys[member.id].reduce((acc, survey) => {
                          const surveyAvg =
                            survey.questions.data.reduce(
                              (sum, q) => sum + q.rating,
                              0,
                            ) / survey.questions.data.length;
                          return acc + surveyAvg;
                        }, 0) / memberSurveys[member.id].length
                      ).toFixed(1)}
                      /5
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  آخر تقييم:{" "}
                  {memberSurveys[member.id]?.[0]
                    ? new Date(
                        memberSurveys[member.id][0].created,
                      ).toLocaleDateString("ar")
                    : "لا يوجد"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200" />
          </div>

          {/* Surveys List */}
          <div className="overflow-y-auto px-1 flex-1 space-y-4 mt-4 custom-scrollbar">
            {memberSurveys[member.id]?.length > 0 ? (
              [...memberSurveys[member.id]].map((survey) => {
                const avgRating =
                  survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
                  survey.questions.data.length;

                const getRatingColor = (rating: number) => {
                  if (rating >= 4)
                    return "bg-green-50 text-green-600 border-green-200";
                  if (rating >= 3)
                    return "bg-blue-50 text-blue-600 border-blue-200";
                  if (rating >= 2)
                    return "bg-yellow-50 text-yellow-600 border-yellow-200";
                  return "bg-red-50 text-red-600 border-red-200";
                };

                return (
                  <div
                    key={survey.id}
                    className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100
                             hover:shadow-md hover:border-gray-200 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(survey.created).toLocaleDateString("ar")}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(avgRating)}`}
                        >
                          {avgRating.toFixed(1)}/5
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200
                                     transition-all duration-200"
                          >
                            عرض التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-50">
                          <DialogTitle>تفاصيل التقييم</DialogTitle>
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
                  لم يتم إضافة أي تقييمات لهذا الطالب بعد
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { SurveysDetailsDialog, SurveysTeacherDetailsDialog };
