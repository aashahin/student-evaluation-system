"use client";

import React, { useState } from "react";
import { Award, Book, FileText, TrendingUp, Users } from "lucide-react";
import { ReadingClub, Survey, User } from "@/types/api";
import ClubStudentTable from "@/components/dashboard/teacher/_components/club-student-table";
import PocketBase from "pocketbase";

type ClubStudentCardProps = {
  selectedClub: ReadingClub;
  surveys: Survey[];
  isLoadingSurveys: boolean;
  countMembers: number;
  clubMembers: User[];
  client: PocketBase;
};

const TABS = [
  { id: "surveys", label: "تقييمات الطلاب", icon: Award },
  { id: "members", label: "أعضاء النادي", icon: Users },
];

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center gap-3 mb-3">
      {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
      <p className="text-sm font-medium text-gray-700">{label}</p>
    </div>
    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

const ClubStudentCard = ({
  selectedClub,
  surveys,
  isLoadingSurveys,
  countMembers,
  clubMembers,
  client,
}: ClubStudentCardProps) => {
  const [activeTab, setActiveTab] = useState("surveys");

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <FileText className="text-blue-600" />
          {selectedClub.name}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-50 px-4 py-2 rounded-full">
            تم الإنشاء:{" "}
            {new Date(selectedClub.created).toLocaleDateString("ar-SA")}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Users />}
          label="عدد الأعضاء"
          value={`${countMembers}/${selectedClub.max_members > 0 ? selectedClub.max_members : "∞"}`}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp />}
          label="معدل النشاط"
          value="85%"
          color="green"
        />
        <StatCard
          icon={<Book />}
          label="الكتب المقروءة"
          value="12"
          color="purple"
        />
      </div>

      <div className="flex gap-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 
              ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }
              transition-all duration-200 whitespace-nowrap font-medium
            `}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <ClubStudentTable
        activeTab={activeTab}
        surveys={surveys}
        clubMembers={clubMembers}
        isLoadingSurveys={isLoadingSurveys}
        clubId={selectedClub.id}
        client={client}
      />
    </div>
  );
};

export default ClubStudentCard;
