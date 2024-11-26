"use client";

import React, {useState} from "react";
import {Award, Book, FileText, Loader, TrendingUp, Users} from "lucide-react";
import {ReadingClub, Survey, User} from "@/types/api";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";

type ClubStudentCardProps = {
    selectedClub: ReadingClub,
    surveys: Survey[]
    isLoadingSurveys: boolean
    countMembers: number
    clubMembers: User[]
}

const TABS = [
    {id: 'surveys', label: 'تقييمات الطلاب', icon: Award},
    {id: 'members', label: 'أعضاء النادي', icon: Users}
];

const ClubStudentCard = (
    {
        selectedClub,
        surveys,
        isLoadingSurveys,
        countMembers,
        clubMembers
    }: ClubStudentCardProps) => {
    const [activeTab, setActiveTab] = useState('surveys');
    const [openSurveyDetails, setOpenSurveyDetails] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    const renderStatCard = (icon: React.ReactNode, label: string, value: string | number, color: string) => (
        <div
            className="bg-white p-5 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
                {React.cloneElement(icon as React.ReactElement, {className: `w-6 h-6 text-${color}-600`})}
                <p className="text-sm font-medium text-gray-700">{label}</p>
            </div>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
    );

    const renderTable = (activeTab: string) => {
        if (activeTab === 'surveys' && isLoadingSurveys) {
            return (
                <div className="flex justify-center items-center p-12">
                    <Loader className="animate-spin text-blue-600 w-8 h-8"/>
                </div>
            );
        }

        return (
            <div className="rounded-xl border border-gray-200">
                <div className="min-w-full inline-block align-middle max-w-[80vw]">
                    <div className="overflow-x-scroll">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                            <tr>
                                {activeTab === 'surveys' ? (
                                    <>
                                        <th scope="col"
                                            className="px-6 py-4 text-start text-sm font-semibold text-gray-900 w-1/4">
                                            اسم الطالب
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                            نوع التقييم
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                            تاريخ التقييم
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                            تفاصيل التقييم
                                        </th>
                                    </>
                                ) : (
                                    <>
                                        <th scope="col"
                                            className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                            اسم الطالب
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                            تاريخ الانضمام
                                        </th>
                                    </>
                                )}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {activeTab === 'surveys' ? (
                                surveys.map((survey) => (
                                    <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {survey.expand?.student_id?.name ?? "غير معروف"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800">
                                                {survey.type === "self-assessment" ? "تقييم ذاتي" :
                                                    survey.type === "teacher-assessment" ? "تقييم المعلم" : "تقييم ولي الأمر"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                                            {new Date(survey.created).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Dialog
                                                open={openSurveyDetails && selectedSurvey?.id === survey.id}
                                                onOpenChange={(open) => {
                                                    setOpenSurveyDetails(open);
                                                    if (open) {
                                                        setSelectedSurvey(survey);
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="link"
                                                    >
                                                        عرض التفاصيل
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>تفاصيل التقييم</DialogTitle>
                                                    <div className="mt-2 border-t border-gray-300"/>
                                                    <div className="space-y-4">
                                                        <p className="font-medium text-gray-700">الأسئلة والإجابات:</p>
                                                        <div className="space-y-3">
                                                            {survey.questions.data.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                                                                >
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="font-semibold text-gray-700 min-w-[100px]">السؤال:</span>
                                                                            <span className="text-gray-600">{item.question}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold text-gray-700 min-w-[100px]">الإجابة:</span>
                                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                                item.answer === "نعم"
                                                                                    ? "bg-green-50 text-green-700"
                                                                                    : "bg-red-50 text-red-700"
                                                                            }`}>
                                {item.answer}
                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                clubMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {member.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                                            {new Date(member.created).toLocaleDateString('ar-SA')}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>

                        {activeTab === 'members' && clubMembers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                لا يوجد أعضاء في النادي حالياً
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 mx-auto min-w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="text-blue-600"/>
                    تفاصيل النادي: {selectedClub.name}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    تم الإنشاء: {new Date(selectedClub.created).toLocaleDateString('ar-SA')}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderStatCard(<Users/>, "عدد الأعضاء",
                    `${countMembers}/${selectedClub.max_members > 0 ? selectedClub.max_members : '∞'}`, "blue")}
                {renderStatCard(<TrendingUp/>, "معدل النشاط", "85%", "green")}
                {renderStatCard(<Book/>, "الكتب المقروءة", "12", "purple")}
            </div>

            <div className="flex gap-2 border-b overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-3 
                            ${activeTab === tab.id
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}
                            transition-all duration-200 whitespace-nowrap
                        `}
                    >
                        <tab.icon className="w-4 h-4"/>
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {renderTable(activeTab)}
        </div>
    );
};

export default ClubStudentCard;
