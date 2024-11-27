"use client";

import React, { useEffect, useState } from "react";
import { Survey, User } from "@/types/api";
import { Loader } from "lucide-react";
import CreateSurveyDialog from "@/components/dashboard/teacher/_components/create-survey-dialog";
import PocketBase from "pocketbase";
import { toast } from "sonner";
import {
  SurveysTeacherDetailsDialog,
  SurveysDetailsDialog,
} from "@/components/dashboard/teacher/_components/surveys-details-dialog";

type ClubStudentTableProps = {
  surveys: Survey[];
  isLoadingSurveys: boolean;
  activeTab: string;
  clubMembers: User[];
  clubId: string;
  client: PocketBase;
  fetchClubs: () => Promise<void>;
};

const ClubStudentTable = ({
  activeTab,
  surveys,
  clubMembers,
  isLoadingSurveys,
  clubId,
  client,
  fetchClubs,
}: ClubStudentTableProps) => {
  const [openSurveyDetails, setOpenSurveyDetails] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [memberSurveys, setMemberSurveys] = useState<Record<string, Survey[]>>(
    {},
  );
  const [openTeacherSurveys, setOpenTeacherSurveys] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

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
        toast.error("حدث خطأ ما أثناء إستدعاء إستبيانات الطلاب");
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
        <div className="overflow-scroll scrollarea">
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
                        <SurveysDetailsDialog
                          openSurveyDetails={openSurveyDetails}
                          setOpenSurveyDetails={setOpenSurveyDetails}
                          selectedSurvey={selectedSurvey}
                          setSelectedSurvey={setSelectedSurvey}
                          survey={survey}
                          key={survey.id}
                        />
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
                        <SurveysTeacherDetailsDialog
                          openTeacherSurveys={openTeacherSurveys}
                          setOpenTeacherSurveys={setOpenTeacherSurveys}
                          selectedMember={selectedMember}
                          setSelectedMember={setSelectedMember}
                          member={member}
                          memberSurveys={memberSurveys}
                          key={member.id}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <CreateSurveyDialog
                          studentId={member.id}
                          clubId={clubId}
                          fetchClubs={fetchClubs}
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
