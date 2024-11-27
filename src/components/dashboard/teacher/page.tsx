"use client";

import React, { useState } from "react";
import { BookOpen, FileText, HelpCircle } from "lucide-react";
import Reports from "@/components/dashboard/teacher/_components/reports";
import Clubs from "@/components/dashboard/teacher/_components/clubs";
import Header from "@/components/dashboard/teacher/_components/header";
import Guide from "@/components/dashboard/_components/guides";

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
      <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {activeTab === "clubs" && <Clubs />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "guide" && <Guide type="teacher" />}
      </div>
    </>
  );
};

export default TeacherDashboard;
