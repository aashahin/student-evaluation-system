import React from "react";
import { SurveysDetailsDialog } from "@/components/dashboard/teacher/_components/surveys-details-dialog";
import { Survey } from "@/types/api";

const SurveyTableHead = () => (
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
      تاريخ التقييم
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      تفاصيل التقييم
    </th>
  </>
);

const SurveyTableRow = ({ surveys }: { surveys: Survey[] }) =>
  surveys
    .filter((survey) => survey.type === "self-assessment")
    .map((survey) => (
      <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {survey.expand?.student_id?.name ?? "غير معروف"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
          {new Date(survey.created).toLocaleDateString("ar")}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <SurveysDetailsDialog survey={survey} key={survey.id} />
        </td>
      </tr>
    ));

export { SurveyTableHead, SurveyTableRow };
