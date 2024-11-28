"use client";

import {
  BarChart2,
  BookOpen,
  Users,
  RefreshCw,
  Info,
  MessageCircleMoreIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import UpcomingDiscussions from "./upcoming-discussions";
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
} from "@/stats/metrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Metrics = {
  currentMembers: number;
  yearStartMembers: number;
  totalBooksRead: number;
  averageBooksPerStudent: number;
  activeParticipants: number;
  participationTrend: number;
  discussionAttendance: number;
  totalDiscussions: number;
};

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

      // Fetch surveys for participation tracking
      const surveys = await client.collection("surveys").getFullList<Survey>({
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

      const activeParticipants = calculateActiveParticipants(members, surveys);
      const participationTrend = calculateParticipationTrend(
        surveys,
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
      console.error("Error fetching metrics:", error);
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  }, [client, period]);

  useEffect(() => {
    fetchMetrics().finally(() => setIsLoading(false));
  }, [fetchMetrics, period]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {isLoading ? (
        <StatsLoadingSkeleton />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl w-full font-semibold flex items-center gap-2 text-gray-900">
              <BarChart2 className="text-blue-500 w-5 h-5" />
              التقرير السنوي
            </h2>
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
      )}

      <UpcomingDiscussions />
    </div>
  );
}

type StatsCardProps = {
  icon: React.ReactNode;
  title: string;
  info?: string;
  stats: {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    change?: number;
  }[];
};

function StatsCard({ icon, title, info, stats }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gray-50">{icon}</div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
        {info && (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Info className="w-4 h-4 text-gray-400" />
              </Tooltip.Trigger>
              <Tooltip.Content className="bg-gray-900 text-white p-2 rounded text-sm">
                {info}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="group">
            <p className="text-sm text-gray-600 mb-1 group-hover:text-gray-900 transition-colors">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600">
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-xl text-amber-600">{stat.suffix}</span>
              )}
              {stat.change !== undefined && (
                <span
                  className={`text-sm font-medium me-2 ${
                    stat.change >= 0
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-red-600 bg-red-50"
                  } px-2 py-1 rounded-full`}
                >
                  {stat.change >= 0 ? "+" : "-"}
                  {Math.abs(stat.change)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

function getStatsConfig(metrics: Metrics) {
  return [
    {
      icon: <Users className="w-4 h-4 text-blue-500" />,
      title: "عدد المشاركين",
      info: "إجمالي عدد الطلاب المشاركين في النوادي",
      stats: [
        {
          label: "العدد الحالي",
          value: metrics.currentMembers,
          change: metrics.currentMembers - metrics.yearStartMembers,
        },
        {
          label: "بداية الفترة",
          value: metrics.yearStartMembers,
        },
      ],
    },
    {
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      title: "الكتب المقروءة",
      info: "إحصائيات الكتب المقروءة خلال الفترة المحددة",
      stats: [
        {
          label: "إجمالي الكتب",
          value: metrics.totalBooksRead,
        },
        {
          label: "المعدل لكل طالب",
          value: metrics.averageBooksPerStudent,
          suffix: "كتاب",
        },
      ],
    },
    {
      icon: <Users className="w-5 h-5 text-amber-500" />,
      title: "المشاركة في الإستبيانات",
      info: "إحصائيات المشاركة في الإستبيانات",
      stats: [
        {
          label: "المشاركون النشطون",
          value: metrics.activeParticipants,
        },
        {
          label: "نسبة التغيير",
          value: Math.abs(metrics.participationTrend),
          suffix: "%",
        },
      ],
    },
    {
      icon: <MessageCircleMoreIcon className="w-5 h-5 text-indigo-500" />,
      title: "حضور المناقشات",
      info: "إحصائيات الطلاب الذين حضروا المناقشات",
      stats: [
        {
          label: "نسبة الحضور",
          value: metrics.discussionAttendance,
          suffix: "%",
        },
        {
          label: "عدد المناقشات",
          value: metrics.totalDiscussions,
        },
      ],
    },
  ];
}
