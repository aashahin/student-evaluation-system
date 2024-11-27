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
);

const SurveyTableRow = ({
  surveys,
  selectedSurvey,
  setSelectedSurvey,
  openSurveyDetails,
  setOpenSurveyDetails,
}: {
  surveys: Survey[];
  selectedSurvey: Survey | null;
  setSelectedSurvey: (survey: Survey | null) => void;
  openSurveyDetails: boolean;
  setOpenSurveyDetails: (open: boolean) => void;
}) =>
  surveys.map((survey) => (
    <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
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
  ));

export { SurveyTableHead, SurveyTableRow };