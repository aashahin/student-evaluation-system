import React from "react";
import CreateSurveyDialog from "@/components/dashboard/teacher/_components/create-survey-dialog";
import { SurveysTeacherDetailsDialog } from "@/components/dashboard/teacher/_components/surveys-details-dialog";
import { Survey, User } from "@/types/api";

const MemberTableHead = () => (
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
);

const MemberTableRow = ({
  members,
  memberSurveys,
  clubId,
  fetchClubs,
}: {
  members: User[];
  memberSurveys: Record<string, Survey[]>;
  clubId: string;
  fetchClubs: () => Promise<void>;
}) =>
  members.map((member) => (
    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {member.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
        {member.age === 0 ? "غير محدد" : member.age}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
        {new Date(member.created).toLocaleDateString("ar")}
      </td>
      <td className="px-4 sm:px-6 py-4 text-center">
        <SurveysTeacherDetailsDialog
          member={member}
          memberSurveys={memberSurveys}
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
  ));

export { MemberTableHead, MemberTableRow };
