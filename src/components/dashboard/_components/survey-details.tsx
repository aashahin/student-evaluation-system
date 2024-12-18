import React from "react";
import { Survey } from "@/types/api";

const SurveyDetails = ({ survey }: { survey: Survey }) => {
  const totalQuestions = survey.questions.data.length;

  // Consider ratings >= 3 as positive
  const positiveAnswers = survey.questions.data.filter(
    (q) => q.rating >= 3,
  ).length;
  const negativeAnswers = survey.questions.data.filter(
    (q) => q.rating < 3,
  ).length;

  // Calculate average rating
  const averageRating =
    survey.questions.data.reduce((acc, q) => acc + q.rating, 0) /
    totalQuestions;

  const getRatingColor = (rating: number) => {
    if (rating >= 4)
      return "bg-green-100 text-green-800 ring-green-200 hover:bg-green-200";
    if (rating >= 3)
      return "bg-blue-100 text-blue-800 ring-blue-200 hover:bg-blue-200";
    if (rating >= 2)
      return "bg-yellow-100 text-yellow-800 ring-yellow-200 hover:bg-yellow-200";
    return "bg-red-100 text-red-800 ring-red-200 hover:bg-red-200";
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4) return "ممتاز";
    if (rating >= 3) return "جيد";
    if (rating >= 2) return "متوسط";
    return "ضعيف";
  };

  return (
    <>
      {/* Header Section */}
      <div className="sticky top-0 z-10 p-4 rounded-xl shadow-sm border bg-white">
        <div className="flex flex-col md:flex-row gap-4 md-gap-0 items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            الأسئلة والتقييمات
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
              {totalQuestions} سؤال
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">
              معدل التقييم: {averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-600 text-sm font-medium">
              تقييمات إيجابية
            </div>
            <div className="text-2xl font-bold text-green-700">
              {positiveAnswers}
            </div>
            <div className="text-green-600 text-sm">
              {((positiveAnswers / totalQuestions) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-red-600 text-sm font-medium">
              تقييمات سلبية
            </div>
            <div className="text-2xl font-bold text-red-700">
              {negativeAnswers}
            </div>
            <div className="text-red-600 text-sm">
              {((negativeAnswers / totalQuestions) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {survey.questions.data.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border
                                 hover:shadow-md transition-all duration-300 ease-in-out
                                 transform hover:-translate-y-1"
          >
            <div className="flex flex-col gap-4">
              {/* Question Section */}
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full
                                              bg-indigo-50 text-indigo-600 font-semibold text-lg
                                              border-2 border-indigo-100"
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    السؤال
                  </label>
                  <p className="text-gray-800 font-medium text-lg">
                    {item.question}
                  </p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="flex items-center gap-3 me-14">
                <label className="text-sm font-medium text-gray-500">
                  التقييم:
                </label>
                <span
                  className={`
                                        px-5 py-2 rounded-full text-sm font-medium 
                                        transition-all duration-300 ease-in-out
                                        hover:scale-105 cursor-default ring-1
                                        ${getRatingColor(item.rating)}
                                    `}
                >
                  {item.rating}/5 - {getRatingText(item.rating)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {totalQuestions === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">لا توجد أسئلة</h3>
          <p className="mt-1 text-gray-500">
            لم يتم إضافة أي أسئلة لهذا الاستبيان بعد
          </p>
        </div>
      )}
    </>
  );
};

export default SurveyDetails;
