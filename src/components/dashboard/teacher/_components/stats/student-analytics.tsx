"use client";

import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Survey, User } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

type StudentAnalyticsProps = {
  surveys: Survey[];
  students: User[];
  isLoading?: boolean;
};

type SkillMetric = {
  name: string;
  value: number;
  fullName: string;
};

export function StudentAnalytics({
  surveys,
  students,
  isLoading = false,
}: StudentAnalyticsProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (studentId: string) => {
    setExpandedRows((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const studentPerformance = useMemo(() => {
    return students.map((student) => {
      const studentSurveys = surveys.filter(
        (survey) => survey.student_id === student.id,
      );

      // Calculate average rating for the student
      const avgRating =
        studentSurveys.reduce((acc, survey) => {
          const surveyAvg =
            survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
            survey.questions.data.length;
          return acc + surveyAvg;
        }, 0) / (studentSurveys.length || 1);

      return {
        name: student.name,
        rating: avgRating.toFixed(2),
      };
    });
  }, [surveys, students]);

  const skillsAnalysis = useMemo(() => {
    // Aggregate all questions to find frequently high-rated skills
    const skillsMap = new Map<string, { total: number; count: number }>();

    surveys.forEach((survey) => {
      survey.questions.data.forEach((q) => {
        const current = skillsMap.get(q.question) || { total: 0, count: 0 };
        skillsMap.set(q.question, {
          total: current.total + q.rating,
          count: current.count + 1,
        });
      });
    });

    // Convert to radar chart format
    const skills: SkillMetric[] = Array.from(skillsMap.entries())
      .map(([name, { total, count }]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        fullName: name,
        value: total / count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Take top 6 skills

    return skills;
  }, [surveys]);

  const studentDetailedPerformance = useMemo(() => {
    return students.map((student) => {
      const studentSurveys = surveys.filter(
        (survey) => survey.student_id === student.id,
      );

      // Get all unique skills
      const skillsMap = new Map<string, { total: number; count: number }>();

      studentSurveys.forEach((survey) => {
        survey.questions.data.forEach((q) => {
          const current = skillsMap.get(q.question) || { total: 0, count: 0 };
          skillsMap.set(q.question, {
            total: current.total + q.rating,
            count: current.count + 1,
          });
        });
      });

      // Calculate average for each skill
      const skills = Array.from(skillsMap.entries())
        .map(([skill, { total, count }]) => ({
          skill,
          average: (total / count).toFixed(2),
        }))
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

      // Calculate overall average
      const overallAverage = (
        skills.reduce((acc, curr) => acc + parseFloat(curr.average), 0) /
        (skills.length || 1)
      ).toFixed(2);

      return {
        id: student.id,
        name: student.name,
        skills,
        topSkills: skills.slice(0, 3),
        overallAverage,
      };
    });
  }, [surveys, students]);

  const monthlyPerformance = useMemo(() => {
    const monthlyData = new Map<
      string,
      Map<string, { total: number; count: number }>
    >();

    surveys.forEach((survey) => {
      const date = new Date(survey.created);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const studentId = survey.student_id;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, new Map());
      }

      const monthStudents = monthlyData.get(monthKey)!;
      if (!monthStudents.has(studentId)) {
        monthStudents.set(studentId, { total: 0, count: 0 });
      }

      const studentStats = monthStudents.get(studentId)!;
      const surveyAvg =
        survey.questions.data.reduce((sum, q) => sum + q.rating, 0) /
        survey.questions.data.length;
      studentStats.total += surveyAvg;
      studentStats.count += 1;
    });

    // Convert to chart format
    const months = Array.from(monthlyData.keys()).sort();
    return months.map((month) => {
      const monthData = monthlyData.get(month)!;
      const dataPoint: Record<string, number | string | null> = {
        month: month,
      };

      students.forEach((student) => {
        const stats = monthData.get(student.id);
        dataPoint[student.name] = stats
          ? Number((stats.total / stats.count).toFixed(2))
          : null;
      });

      return dataPoint;
    });
  }, [surveys, students]);

  return (
    <div className="space-y-6" dir={"rtl"}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" dir={"rtl"}>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">نظرة عامة عن التقييم</h3>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="relative w-full overflow-x-auto">
              <BarChart
                width={Math.min(800, window.innerWidth - 100)}
                height={300}
                data={studentPerformance}
                margin={{ top: 20, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  padding={{ left: 100, right: 100 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(147, 197, 253, 0.1)" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "8px",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar
                  dataKey="rating"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="متوسط التقييم"
                  animationDuration={1000}
                />
              </BarChart>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">توزيع المهارات</h3>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex justify-center" dir={"rtl"}>
              <RadarChart
                width={Math.min(500, window.innerWidth - 100)}
                height={400}
                data={skillsAnalysis}
                className="transition-all duration-300 ease-in-out"
              >
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 5]}
                  tick={{ fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "8px",
                  }}
                  formatter={(value: number, _name: string, props) => [
                    `${value.toFixed(2)}/5.00`,
                    props.payload.fullName,
                  ]}
                />
                <Radar
                  name="متوسط تقييم المهارات"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#818cf8"
                  fillOpacity={0.6}
                  animationDuration={1000}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </RadarChart>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">أداء الطلاب الشهري</h3>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyPerformance}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              >
                <defs>
                  {students.map((student, index) => {
                    // Professional color palette with good contrast
                    const colors = [
                      { main: "#2563eb", gradient: "#93c5fd" }, // Blue
                      { main: "#059669", gradient: "#6ee7b7" }, // Green
                      { main: "#7c3aed", gradient: "#c4b5fd" }, // Purple
                      { main: "#db2777", gradient: "#f9a8d4" }, // Pink
                      { main: "#ea580c", gradient: "#fdba74" }, // Orange
                      { main: "#4f46e5", gradient: "#a5b4fc" }, // Indigo
                      { main: "#0891b2", gradient: "#67e8f9" }, // Cyan
                      { main: "#be123c", gradient: "#fda4af" }, // Rose
                    ];
                    const colorIndex = index % colors.length;
                    const color = colors[colorIndex];

                    return (
                      <linearGradient
                        key={student.id}
                        id={`color-${student.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={color.gradient}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={color.gradient}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#374151", fontSize: 12 }}
                  tickLine={{ stroke: "#9ca3af" }}
                  axisLine={{ stroke: "#9ca3af" }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split("-");
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return new Intl.DateTimeFormat("ar-EG", {
                      month: "short",
                    }).format(date);
                  }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fill: "#374151", fontSize: 12 }}
                  tickLine={{ stroke: "#9ca3af" }}
                  axisLine={{ stroke: "#9ca3af" }}
                  label={{
                    value: "التقييم",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#1f2937", fontWeight: 500 },
                  }}
                  tickFormatter={(value) => `${value}/5`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    boxShadow:
                      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                    direction: "rtl",
                    fontSize: "14px",
                    color: "#1f2937",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}/5`,
                    `الطالب: ${name}`,
                  ]}
                  labelFormatter={(label) => `الشهر: ${label}`}
                  cursor={{ stroke: "#9ca3af", strokeWidth: 1 }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    direction: "rtl",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                  formatter={(value) => `الطالب: ${value}`}
                  iconType="diamond"
                />
                {students.map((student, index) => {
                  const colors = [
                    { main: "#2563eb", gradient: "#93c5fd" }, // Blue
                    { main: "#059669", gradient: "#6ee7b7" }, // Green
                    { main: "#7c3aed", gradient: "#c4b5fd" }, // Purple
                    { main: "#db2777", gradient: "#f9a8d4" }, // Pink
                    { main: "#ea580c", gradient: "#fdba74" }, // Orange
                    { main: "#4f46e5", gradient: "#a5b4fc" }, // Indigo
                    { main: "#0891b2", gradient: "#67e8f9" }, // Cyan
                    { main: "#be123c", gradient: "#fda4af" }, // Rose
                  ];
                  const colorIndex = index % colors.length;
                  const color = colors[colorIndex];

                  return (
                    <Line
                      key={student.id}
                      type="monotone"
                      dataKey={student.name}
                      stroke={color.main}
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: "#ffffff",
                        stroke: color.main,
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: color.main,
                        stroke: "#ffffff",
                      }}
                      fill={`url(#color-${student.id})`}
                      connectNulls
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Student Skills Table */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">تقييمات الطلاب التفصيلية</h3>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="relative w-full scrollarea">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">اسم الطالب</TableHead>
                  <TableHead className="w-[400px]">أفضل المهارات</TableHead>
                  <TableHead className="w-[150px] text-center">
                    المتوسط العام
                  </TableHead>
                  <TableHead className="w-[150px] text-center">
                    التفاصيل
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentDetailedPerformance.map((student) => (
                  <React.Fragment key={student.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium w-[200px]">
                        {student.name}
                      </TableCell>
                      <TableCell className="w-[400px]">
                        <div className="flex flex-wrap gap-2">
                          {student.topSkills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 overflow-clip truncate"
                            >
                              <Star className="h-3 w-3" />
                              {skill.skill}
                              <span className="ml-1 text-xs">
                                ({skill.average})
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="w-[150px] text-center">
                        <Badge
                          variant="outline"
                          className="text-md font-semibold"
                        >
                          {student.overallAverage}/5.00
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[150px] text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRow(student.id)}
                          className="flex items-center gap-2"
                        >
                          {expandedRows.includes(student.id) ? (
                            <>
                              إخفاء التفاصيل
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              عرض التفاصيل
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.includes(student.id) && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-muted/30">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                            {student.skills.map((skill, index) => (
                              <div
                                key={index}
                                className="flex flex-col space-y-1 p-3 rounded-lg bg-white shadow-sm"
                              >
                                <span className="text-sm font-medium">
                                  {skill.skill}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                      width: `${
                                        (parseFloat(skill.average) / 5) * 100
                                      }%`,
                                    }}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {skill.average}/5.00
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground text-center bg-gray-100 rounded-lg p-4">
        * قم بالتمرير فوق عناصر الرسم البياني لرؤية معلومات مفصلة
      </div>
    </div>
  );
}
