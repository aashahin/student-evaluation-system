"use client";

import React, { useEffect, useState } from "react";
import { FileText, UserCheck } from "lucide-react";
import Header from "@/components/dashboard/teacher/_components/header";
import dynamic from "next/dynamic";
import { pb } from "@/lib/api";
import SetupWizard from "@/components/dashboard/parent/_components/setup-wizard";

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

const ParentDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("evaluations");
  const client = pb();
  const studentId = client.authStore.record?.student_id;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!studentId) {
    return (
      <SetupWizard
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
        title="لوحة ولي الأمر"
      />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {activeTab === "evaluations" && <Evaluations />}
        {activeTab === "guide" && <Guides type="parent" />}
      </div>
    </>
  );
};

export default ParentDashboard;
