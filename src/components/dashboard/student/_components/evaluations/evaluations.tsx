import React, { useCallback } from "react";
import { pb } from "@/lib/api";
import { Survey, SurveyType } from "@/types/api";
import { StarIcon, TrendingUpIcon } from "lucide-react";
import SurveysList from "@/components/dashboard/student/_components/evaluations/surveys-list";

const surveyTypeLabels: Record<SurveyType, string> = {
  "self-assessment": "تقييم ذاتي",
  "teacher-assessment": "تقييم المعلم",
  "parent-assessment": "تقييم ولي الأمر",
};

const surveyTypeStyles: Record<SurveyType, string> = {
  "self-assessment": "bg-violet-50 text-violet-700 border-violet-200",
  "teacher-assessment": "bg-blue-50 text-blue-700 border-blue-200",
  "parent-assessment": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const Evaluations = () => {
  const [surveys, setSurveys] = React.useState<Survey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const client = pb();
  const studentId = client.authStore.record?.id;

  const fetchSurveys = useCallback(async () => {
    try {
      setIsLoading(true);
      const surveys = await client.collection("surveys").getFullList<Survey>({
        filter: `student_id = "${studentId}"`,
        sort: "-created",
        requestKey: Math.random().toString(),
      });
      setSurveys(surveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setIsLoading(false);
    }
  }, [client, studentId]);

  React.useEffect(() => {
    if (studentId) {
      fetchSurveys();
    }
  }, [fetchSurveys, studentId]);

  if (!studentId) return null;

  const calculateStats = () => {
    if (surveys.length === 0) return null;

    const totalAvg =
      surveys.reduce((acc, survey) => {
        const surveyAvg =
          survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
          survey.questions.data.length;
        return acc + surveyAvg;
      }, 0) / surveys.length;

    const typeCount = surveys.reduce(
      (acc, survey) => {
        acc[survey.type] = (acc[survey.type] || 0) + 1;
        return acc;
      },
      {} as Record<SurveyType, number>,
    );

    return { totalAvg, typeCount };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">نماذج التقييم</h1>
        <p className="text-gray-600">متابعة وتحليل جميع التقييمات الخاصة بك</p>
      </div>

      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Average Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  المعدل العام
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalAvg.toFixed(1)}/5
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUpIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Survey Type Cards */}
          {Object.entries(surveyTypeLabels).map(([type, label]) => (
            <div
              key={type}
              className={`${surveyTypeStyles[type as SurveyType]} p-6 rounded-xl shadow-sm border hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">{label}</p>
                  <h3 className="text-2xl font-bold">
                    {stats.typeCount[type as SurveyType] || 0}
                  </h3>
                </div>
                <div className="p-3 bg-white/50 rounded-full">
                  <StarIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Surveys List */}
      <SurveysList
        isLoading={isLoading}
        surveys={surveys}
        surveyTypeLabels={surveyTypeLabels}
        surveyTypeStyles={surveyTypeStyles}
      />
    </div>
  );
};

export default Evaluations;
