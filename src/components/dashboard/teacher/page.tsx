"use client";

import React, { useState } from "react";
import { BookOpen, FileText, HelpCircle } from "lucide-react";
import Header from "@/components/dashboard/teacher/_components/header";
import dynamic from "next/dynamic";

const Clubs = dynamic(
  () => import("@/components/dashboard/teacher/_components/clubs"),
  {
    ssr: false,
  },
);
const Reports = dynamic(
  () => import("@/components/dashboard/teacher/_components/reports"),
  {
    ssr: false,
  },
);
const Guide = dynamic(
  () => import("@/components/dashboard/_components/guides"),
  {
    ssr: false,
  },
);

const tabs = [
  {
    id: "clubs",
    label: "نوادي القراءة",
    icon: BookOpen,
  },
  {
    id: "reports",
    label: "التقارير",
    icon: FileText,
  },
  {
    id: "guide",
    label: "الدليل الإرشادي",
    icon: HelpCircle,
  },
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("clubs");

  return (
    <>
      <Header
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        title="لوحة المعلم"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {activeTab === "clubs" && <Clubs />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "guide" && <Guide type="teacher" />}
      </div>
    </>
  );
};

export default TeacherDashboard;
