import { BookOpen, MessageCircleMoreIcon, Users } from "lucide-react";
import { Metrics } from "@/stats/metrics";

export function getStatsConfig(metrics: Metrics) {
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
