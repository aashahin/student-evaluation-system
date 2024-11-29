"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, FileText, BookMarked, UserCheck } from "lucide-react";
import Header from "@/components/dashboard/teacher/_components/header";
import dynamic from "next/dynamic";
import { pb } from "@/lib/api";
import ReaderToolkit from "@/components/dashboard/student/_components/reader-toolkit";
import SetupWizard from "@/components/dashboard/student/_components/setup-wizard";

const ReadingMaterials = dynamic(
  () => import("@/components/dashboard/student/_components/reading-materials"),
  {
    ssr: false,
  },
);
const Evaluations = dynamic(
  () =>
    import(
      "@/components/dashboard/student/_components/evaluations/evaluations"
    ),
  {
    ssr: false,
  },
);
const Guides = dynamic(
  () => import("@/components/dashboard/_components/guides"),
  {
    ssr: false,
  },
);

const tabs = [
  {
    id: "reading-materials",
    label: "المواد المقروءة",
    icon: BookOpen,
  },
  {
    id: "evaluations",
    label: "نماذج التقييم",
    icon: FileText,
  },
  {
    id: "reader-toolkit",
    label: "حقيبة القارئ",
    icon: BookMarked,
  },
  {
    id: "guide",
    label: "دليل نادي القراءة",
    icon: UserCheck,
  },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("reading-materials");
  const [mounted, setMounted] = useState(false);
  const client = pb();
  const studentId = client.authStore.record?.id;
  const clubId = client.authStore.record?.club_id;
  const grade_level = client.authStore.record?.grade_level;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!studentId || !mounted) {
    return null;
  }

  if (!clubId || !grade_level) {
    return (
      <SetupWizard
        studentId={studentId}
        onComplete={() => {
          window.location.reload();
        }}
      />
    );
  }

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
        {activeTab === "evaluations" && <Evaluations />}
        {activeTab === "reader-toolkit" && <ReaderToolkit />}
        {activeTab === "guide" && <Guides type="student" />}
      </div>
    </>
  );
};

export default StudentDashboard;
