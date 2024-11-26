"use client";

import React, { useEffect, useState } from "react";
import { Survey, User } from "@/types/api";
import { CalendarIcon, ClipboardIcon, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SurveyDetails from "@/components/dashboard/_components/survey-details";
import CreateSurveyDialog from "@/components/dashboard/teacher/_components/create-survey-dialog";
import PocketBase from "pocketbase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClubStudentTableProps = {
  surveys: Survey[];
  isLoadingSurveys: boolean;
  activeTab: string;
  clubMembers: User[];
  clubId: string;
  client: PocketBase;
};

const ClubStudentTable = ({
  activeTab,
  surveys,
  clubMembers,
  isLoadingSurveys,
  clubId,
  client,
}: ClubStudentTableProps) => {
  const [openSurveyDetails, setOpenSurveyDetails] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [memberSurveys, setMemberSurveys] = useState<Record<string, Survey[]>>(
    {},
  );
  const [openTeacherSurveys, setOpenTeacherSurveys] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const fetchMemberSurveys = async () => {
      try {
        const surveysMap: Record<string, Survey[]> = {};

        for (const member of clubMembers) {
          surveysMap[member.id] = await client
            .collection("surveys")
            .getFullList({
              filter: `club_id = "${clubId}" && student_id = "${member.id}"`,
              sort: "-created",
              requestKey: Math.random().toString(),
              expand: "student_id",
            });
        }

        setMemberSurveys(surveysMap);
      } catch (error) {
        console.error("Error fetching member surveys:", error);
      }
    };

    if (activeTab === "members" && clubMembers.length > 0) {
      fetchMemberSurveys();
    }
  }, [activeTab, clubMembers, clubId, client]);

  if (activeTab === "surveys" && isLoadingSurveys) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200">
      <div className="min-w-full inline-block align-middle max-w-[80vw] sm:max-w-full">
        <div className="overflow-x-scroll">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === "surveys" ? (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-4 text-start text-sm font-semibold text-gray-900 w-1/4"
                    >
                      اسم الطالب
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      نوع التقييم
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      تاريخ التقييم
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      تفاصيل التقييم
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-900"
                    >
                      اسم الطالب
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      العمر
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      تاريخ الانضمام
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      عدد التقييمات
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                    >
                      تقييم الطالب
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === "surveys"
                ? surveys.map((survey) => (
                    <tr
                      key={survey.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {survey.expand?.student_id?.name ?? "غير معروف"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800">
                          {survey.type === "self-assessment"
                            ? "تقييم ذاتي"
                            : survey.type === "teacher-assessment"
                              ? "تقييم المعلم"
                              : "تقييم ولي الأمر"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {new Date(survey.created).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Dialog
                          open={
                            openSurveyDetails &&
                            selectedSurvey?.id === survey.id
                          }
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
                      </td>
                    </tr>
                  ))
                : clubMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {member.age === 0 ? "غير محدد" : member.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {new Date(member.created).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <Dialog
                          open={
                            openTeacherSurveys &&
                            selectedMember?.id === member.id
                          }
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
                              <span className="group-hover:underline">
                                تقييم
                              </span>
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="bg-gray-50 w-[95vw] md:max-w-[40rem] max-h-[90vh] p-4 sm:p-6 rounded-xl">
                            <div className="flex flex-col h-full">
                              {/* Header */}
                              <div className="sticky top-0 bg-gray-50 z-10 pb-4">
                                <DialogTitle className="text-xl sm:text-2xl font-semibold mb-4">
                                  تقييمات الطالب: {member.name}
                                </DialogTitle>

                                {/* Stats & Controls */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <div className="bg-blue-50 px-4 py-2 rounded-full transition-all hover:bg-blue-100">
                                      <span className="text-sm font-medium text-blue-700">
                                        {memberSurveys[member.id]?.length ?? 0}{" "}
                                        تقييم
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span>
                                      آخر تقييم:{" "}
                                      {memberSurveys[member.id]?.[0]
                                        ? new Date(
                                            memberSurveys[member.id][0].created,
                                          ).toLocaleDateString("ar-SA")
                                        : "لا يوجد"}
                                    </span>
                                  </div>
                                </div>

                                <div className="border-t border-gray-200" />
                              </div>

                              {/* Surveys List */}
                              <div className="overflow-y-auto px-1 flex-1 space-y-4 mt-4 custom-scrollbar">
                                {memberSurveys[member.id]?.length > 0 ? (
                                  [...memberSurveys[member.id]]
                                    .sort((a, b) => {
                                      const dateA = new Date(
                                        a.created,
                                      ).getTime();
                                      const dateB = new Date(
                                        b.created,
                                      ).getTime();
                                      return sortBy === "newest"
                                        ? dateB - dateA
                                        : dateA - dateB;
                                    })
                                    .map((survey) => (
                                      <div
                                        key={survey.id}
                                        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100
                    hover:shadow-md hover:border-gray-200 transition-all duration-200"
                                      >
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                          <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            {new Date(
                                              survey.created,
                                            ).toLocaleDateString("ar-SA")}
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
                                              <DialogTitle>
                                                تفاصيل التقييم
                                              </DialogTitle>
                                              <div className="mt-2 border-t border-gray-200" />
                                              <SurveyDetails survey={survey} />
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    ))
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
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <CreateSurveyDialog
                          studentId={member.id}
                          clubId={clubId}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {activeTab === "members" && clubMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا يوجد أعضاء في النادي حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubStudentTable;
