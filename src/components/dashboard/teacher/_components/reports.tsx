"use client";

import { BarChart2, RefreshCw, Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pb } from "@/lib/api";
import {
  Discussion,
  ReadingBook,
  ReadingClub,
  Survey,
  User,
} from "@/types/api";
import {
  calculateActiveParticipants,
  calculateParticipationTrend,
  Metrics,
} from "@/stats/metrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/teacher/_components/stats/state-card";
import { getStatsConfig } from "@/components/dashboard/teacher/_components/stats/stats-config";
import { StudentAnalytics } from "@/components/dashboard/teacher/_components/stats/student-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Period = "year" | "semester" | "month";

export default function Reports() {
  const [metrics, setMetrics] = useState<Metrics>({
    currentMembers: 0,
    yearStartMembers: 0,
    totalBooksRead: 0,
    averageBooksPerStudent: 0,
    activeParticipants: 0,
    participationTrend: 0,
    discussionAttendance: 0,
    totalDiscussions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("year");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const client = pb();

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const teacherId = client.authStore.record?.id;

      // Fetch teacher's clubs
      const clubs = await client
        .collection("reading_clubs")
        .getFullList<ReadingClub>({
          filter: `teacher_id = "${teacherId}"`,
          requestKey: Math.random().toString(),
        });

      const clubIds = clubs.map((club) => club.id);

      // Fetch all members with their join dates
      const members = await client.collection("users").getFullList<User>({
        filter: `role = "student"`,
        sort: "created",
        requestKey: Math.random().toString(),
      });

      // Fetch reading books
      const readingBooks = await client
        .collection("reading_books")
        .getFullList<ReadingBook>({
          filter: clubIds.map((id) => `club_id = "${id}"`).join("||"),
          requestKey: Math.random().toString(),
        });

      // Fetch surveys and students for analytics
      const surveysResult = await client
        .collection("surveys")
        .getFullList<Survey>({
          requestKey: Math.random().toString(),
        });
      const studentsResult = await client
        .collection("users")
        .getFullList<User>({
          filter: 'role = "student"',
          requestKey: Math.random().toString(),
        });

      setSurveys(surveysResult);
      setStudents(studentsResult);

      // Fetch surveys for participation tracking
      const surveysForParticipation = await client
        .collection("surveys")
        .getFullList<Survey>({
          filter: clubIds.map((id) => `club_id = "${id}"`).join("||"),
          sort: "created",
          requestKey: Math.random().toString(),
        });

      // Calculate metrics based on selected period
      const periodStart = getPeriodStartDate(period);

      const currentMembers = members.length;
      const yearStartMembers = members.filter(
        (member) => new Date(member.created) <= periodStart,
      ).length;

      const totalBooksRead = readingBooks.filter((book) => book.is_read).length;
      const averageBooksPerStudent =
        currentMembers > 0
          ? Number((totalBooksRead / currentMembers).toFixed(1))
          : 0;

      const activeParticipants = calculateActiveParticipants(
        members,
        surveysForParticipation,
      );
      const participationTrend = calculateParticipationTrend(
        surveysForParticipation,
        periodStart,
      );

      const discussions = await client
        .collection("discussions")
        .getFullList<Discussion>({
          filter: clubIds.map((id) => `club_id = "${id}"`).join("||"),
          sort: "discussion_date",
          requestKey: Math.random().toString(),
        });

      const totalDiscussions = discussions.length;
      const attendedDiscussions = discussions.filter((d) => d.attended).length;
      const discussionAttendance =
        totalDiscussions > 0
          ? Math.round((attendedDiscussions / totalDiscussions) * 100)
          : 0;

      setMetrics({
        currentMembers,
        yearStartMembers,
        totalBooksRead,
        averageBooksPerStudent,
        activeParticipants,
        participationTrend,
        discussionAttendance,
        totalDiscussions,
      });
    } catch (error) {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  }, [client, period]);

  useEffect(() => {
    fetchMetrics().finally(() => setIsLoading(false));
  }, [fetchMetrics, period]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="stats" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 items-center mb-6">
          <TabsList>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              التقرير العام
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              تحليل الطلاب
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <Select
              value={period}
              onValueChange={(e) => setPeriod(e as Period)}
            >
              <SelectTrigger>الفترة</SelectTrigger>
              <SelectContent>
                <SelectItem value="year">سنوي</SelectItem>
                <SelectItem value="semester">فصلي</SelectItem>
                <SelectItem value="month">شهري</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => fetchMetrics()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <StatsLoadingSkeleton />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <TabsContent value="stats" className="mt-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="grid sm:grid-cols-2 gap-4">
                  {getStatsConfig(metrics).map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <StatsCard {...stat} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <StudentAnalytics surveys={surveys} students={students} />
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      dir={"rtl"}
    >
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 h-40"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {message}
    </div>
  );
}

function getPeriodStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "semester":
      return new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
  }
}
