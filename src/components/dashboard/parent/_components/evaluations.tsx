import React, { useCallback } from "react";
import { pb } from "@/lib/api";
import { Survey, SurveyType } from "@/types/api";
import { toast } from "sonner";
import { StatsOverview } from "./evaluations/stats-overview";
import { Filters } from "./evaluations/filters";
import { SurveyList } from "./evaluations/survey-list";
import { SurveyDialog } from "./evaluations/survey-dialog";
import { StatsData } from "./evaluations/types";

const ParentEvaluations = () => {
  const [surveys, setSurveys] = React.useState<Survey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<SurveyType | "all">(
    "all",
  );
  const [selectedSurvey, setSelectedSurvey] = React.useState<Survey | null>(
    null,
  );
  const client = pb();
  const studentId = client.authStore.record?.student_id;

  const fetchSurveys = useCallback(async () => {
    if (!studentId) return;

    try {
      setIsLoading(true);
      const surveys = await client.collection("surveys").getFullList<Survey>({
        filter: `student_id = "${studentId}"`,
        sort: "-created",
        requestKey: Math.random().toString(),
        expand: "student_id",
      });
      setSurveys(surveys);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحصول على التقييمات");
    } finally {
      setIsLoading(false);
    }
  }, [client, studentId]);

  React.useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const calculateStats = (): StatsData | null => {
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

    const monthlyProgress = surveys.reduce(
      (acc, survey) => {
        const month = new Date(survey.created).toLocaleString("ar-SA", {
          month: "long",
        });
        const avg =
          survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
          survey.questions.data.length;
        if (!acc[month]) {
          acc[month] = { count: 0, total: 0 };
        }
        acc[month].count++;
        acc[month].total += avg;
        return acc;
      },
      {} as Record<string, { count: number; total: number }>,
    );

    return { totalAvg, typeCount, monthlyProgress };
  };

  const stats = calculateStats();

  const filteredSurveys = surveys.filter((survey) => {
    const matchesType = selectedType === "all" || survey.type === selectedType;
    const matchesSearch = survey.questions.data.some((q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="opacity-70">
              <div className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تقييمات الطالب
        </h1>
        <p className="text-gray-600">متابعة وتحليل جميع تقييمات الطالب</p>
      </div>

      {stats && <StatsOverview stats={stats} totalSurveys={surveys.length} />}

      <Filters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <div className="space-y-6">
        <SurveyList
          filteredSurveys={filteredSurveys}
          onResetFilters={() => {
            setSearchQuery("");
            setSelectedType("all");
          }}
          onSelectSurvey={setSelectedSurvey}
        />
      </div>

      <SurveyDialog
        survey={selectedSurvey}
        onOpenChange={(open) => !open && setSelectedSurvey(null)}
      />
    </div>
  );
};

export default ParentEvaluations;
