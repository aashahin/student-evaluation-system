"use client";

import React, { useState } from "react";
import { BookOpen, FileText, BookMarked, UserCheck } from "lucide-react";
import Header from "@/components/dashboard/teacher/_components/header";
import Guide from "@/components/dashboard/_components/guides";
import ReadingMaterials from "@/components/dashboard/student/_components/reading-materials";

const tabs = [
  {
    id: "reading-materials",
    label: "المواد المقروءة",
    icon: BookOpen,
  },
  {
    id: "reader-toolkit",
    label: "حقيبة القارئ",
    icon: BookMarked,
  },
  {
    id: "evaluations",
    label: "نماذج التقييم",
    icon: FileText,
  },
  {
    id: "guide",
    label: "دليل نادي القراءة",
    icon: UserCheck,
  },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("reading-materials");

  return (
    <>
      <Header
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        title="لوحة الطالب"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {activeTab === "reading-materials" && <ReadingMaterials />}
        {activeTab === "reader-toolkit" && <ReaderToolkit />}
        {activeTab === "evaluations" && <Evaluations />}
        {activeTab === "guide" && <Guide type="student" />}
      </div>
    </>
  );
};

// Reader Toolkit Component
const ReaderToolkit = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">حقيبة القارئ</h2>
      {/* Add content for reader toolkit */}
    </div>
  );
};

// Evaluations Component
const Evaluations = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">نماذج التقييم</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-right">
            بطاقة تقييم الكتاب
          </h3>
          {/* Add book evaluation form */}
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-right">
            نموذج التقييم الذاتي
          </h3>
          {/* Add self-assessment form */}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
