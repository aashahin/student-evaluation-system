"use client";

import { BarChart2, BookOpen, TrendingUp, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import UpcomingDiscussions from "./upcoming-discussions";
import { pb } from "@/lib/api";
import { ReadingBook, ReadingClub, Survey, User } from "@/types/api";

type Metrics = {
  currentMembers: number;
  yearStartMembers: number;
  totalBooksRead: number;
  averageBooksPerStudent: number;
  activeParticipants: number;
  participationTrend: number;
};

export default function Reports() {
  const [metrics, setMetrics] = useState<Metrics>({
    currentMembers: 0,
    yearStartMembers: 0,
    totalBooksRead: 0,
    averageBooksPerStudent: 0,
    activeParticipants: 0,
    participationTrend: 0,
  });

  const client = pb();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const teacherId = client.authStore.record?.id;
      const currentDate = new Date();
      const yearStart = new Date(currentDate.getFullYear(), 8, 1); // September 1st

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

      // Calculate metrics
      const currentMembers = members.length;
      const yearStartMembers = members.filter(
        (member) => new Date(member.created) <= yearStart,
      ).length;

      const totalBooksRead = readingBooks.filter((book) => book.is_read).length;
      const averageBooksPerStudent =
        currentMembers > 0
          ? Number((totalBooksRead / currentMembers).toFixed(1))
          : 0;

      // Calculate active participants (students who participated in >75% of discussions)
      const activeParticipants = calculateActiveParticipants(members, surveys);

      // Calculate participation trend
      const participationTrend = calculateParticipationTrend(
        surveys,
        yearStart,
      );

      setMetrics({
        currentMembers,
        yearStartMembers,
        totalBooksRead,
        averageBooksPerStudent,
        activeParticipants,
        participationTrend,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-800">
          <BarChart2 className="text-blue-600 w-6 h-6" />
          التقرير السنوي
        </h2>

        <div className="space-y-8">
          {/* Members Card */}
          <MetricCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            title="عدد المشاركين"
            metrics={[
              {
                label: "العدد الحالي",
                value: metrics.currentMembers,
                color: "text-blue-600",
                trend:
                  metrics.currentMembers > metrics.yearStartMembers
                    ? "up"
                    : "down",
              },
              {
                label: "بداية السنة",
                value: metrics.yearStartMembers,
                color: "text-blue-600",
              },
            ]}
          />

          {/* Books Card */}
          <MetricCard
            icon={<BookOpen className="w-5 h-5 text-green-600" />}
            title="الكتب المقروءة"
            metrics={[
              {
                label: "إجمالي الكتب",
                value: metrics.totalBooksRead,
                color: "text-green-600",
              },
              {
                label: "المعدل لكل طالب",
                value: metrics.averageBooksPerStudent,
                color: "text-green-600",
                suffix: " كتاب",
              },
            ]}
          />

          {/* Participation Card */}
          <MetricCard
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            title="المشاركة في المناقشات"
            metrics={[
              {
                label: "المشاركون النشطون",
                value: metrics.activeParticipants,
                color: "text-purple-600",
              },
              {
                label: "نسبة التغير",
                value: Math.abs(metrics.participationTrend),
                color:
                  metrics.participationTrend >= 0
                    ? "text-green-600"
                    : "text-red-600",
                prefix: metrics.participationTrend >= 0 ? "+" : "-",
                suffix: "%",
              },
            ]}
          />
        </div>
      </div>

      <UpcomingDiscussions />
    </div>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  metrics: {
    label: string;
    value: number;
    color: string;
    prefix?: string;
    suffix?: string;
    trend?: "up" | "down";
  }[];
};

function MetricCard({ icon, title, metrics }: MetricCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl transition-all">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="font-semibold text-gray-700">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <p className="text-gray-600 text-sm mb-2">{metric.label}</p>
            <div className="flex items-center gap-1">
              {metric.prefix && (
                <span className={`text-2xl font-bold ${metric.color}`}>
                  {metric.prefix}
                </span>
              )}
              <span className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
              {metric.suffix && (
                <span className={`text-lg ${metric.color}`}>
                  {metric.suffix}
                </span>
              )}
              {metric.trend && (
                <span
                  className={`ml-2 ${
                    metric.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {metric.trend === "up" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function calculateActiveParticipants(
  members: User[],
  surveys: Survey[],
): number {
  const participationThreshold = 0.75;
  let activeCount = 0;

  members.forEach((member) => {
    const memberSurveys = surveys.filter(
      (survey) => survey.student_id === member.id,
    );
    if (memberSurveys.length / surveys.length >= participationThreshold) {
      activeCount++;
    }
  });

  return activeCount;
}

function calculateParticipationTrend(
  surveys: Survey[],
  yearStart: Date,
): number {
  const firstHalfSurveys = surveys.filter(
    (survey) =>
      new Date(survey.created) <
      new Date(yearStart.getTime() + (Date.now() - yearStart.getTime()) / 2),
  ).length;

  const secondHalfSurveys = surveys.length - firstHalfSurveys;

  if (firstHalfSurveys === 0) return 0;

  return Math.round(
    ((secondHalfSurveys - firstHalfSurveys) / firstHalfSurveys) * 100,
  );
}
