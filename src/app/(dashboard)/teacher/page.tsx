"use client";

import React, {useState} from "react";
import {BookOpen, FileText} from "lucide-react";
import Reports from "@/app/(dashboard)/teacher/_components/reports";
import Clubs from "@/app/(dashboard)/teacher/_components/clubs";
import Header from "@/app/(dashboard)/teacher/_components/header";

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
];

const TeacherDashboard = () => {
    const [activeTab, setActiveTab] = useState("clubs");

    return (
        <>
            <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>

            <div className="container mx-auto px-4 sm:px-6 py-8">
                {activeTab === "clubs" && <Clubs/>}
                {activeTab === "reports" && <Reports/>}
            </div>
        </>
    );
};

export default TeacherDashboard;
