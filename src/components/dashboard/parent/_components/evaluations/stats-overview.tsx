import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StarIcon, ChartBarIcon, TrendingUpIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatsData, surveyTypeStyles, surveyTypeLabels } from "./types";
import { SurveyType } from "@/types/api";

type StatsOverviewProps = {
  stats: StatsData;
  totalSurveys: number;
};

export const StatsOverview = ({ stats, totalSurveys }: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="hover:shadow transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المعدل العام</CardTitle>
          <div className="p-2 rounded-full bg-yellow-50">
            <StarIcon className="h-4 w-4 text-yellow-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.totalAvg.toFixed(1)}/5
          </div>
          <Progress value={stats.totalAvg * 20} className="h-2 mt-3" />
        </CardContent>
      </Card>

      <Card className="hover:shadow transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي التقييمات
          </CardTitle>
          <div className="p-2 rounded-full bg-blue-50">
            <ChartBarIcon className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{totalSurveys}</div>
          <div className="flex gap-2 mt-3">
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <TooltipProvider key={type}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105",
                        surveyTypeStyles[type as SurveyType],
                      )}
                    >
                      {count}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{surveyTypeLabels[type as SurveyType]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التقدم الشهري</CardTitle>
          <div className="p-2 rounded-full bg-green-50">
            <TrendingUpIcon className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.monthlyProgress)
              .slice(-2)
              .map(([month, data]) => (
                <div key={month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{month}</span>
                    <span className="font-medium text-gray-900">
                      {(data.total / data.count).toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={(data.total / data.count) * 20}
                    className="h-2"
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
