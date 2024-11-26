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

const StatCard = ({ icon, label, value, color }: {
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

const SurveyDetails = ({ survey }: { survey: Survey }) => {
    const totalQuestions = survey.questions.data.length;
    const positiveAnswers = survey.questions.data.filter(q => q.answer === "نعم").length;
    const negativeAnswers = totalQuestions - positiveAnswers;

    return (
        <>
            {/* Header Section */}
            <div className="sticky top-0 z-10 p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">الأسئلة والإجابات</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                            {totalQuestions} سؤال
                        </span>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-green-600 text-sm font-medium">إجابات إيجابية</div>
                        <div className="text-2xl font-bold text-green-700">{positiveAnswers}</div>
                        <div className="text-green-600 text-sm">
                            {((positiveAnswers / totalQuestions) * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-red-600 text-sm font-medium">إجابات سلبية</div>
                        <div className="text-2xl font-bold text-red-700">{negativeAnswers}</div>
                        <div className="text-red-600 text-sm">
                            {((negativeAnswers / totalQuestions) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {survey.questions.data.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100
                                 hover:shadow-md transition-all duration-300 ease-in-out
                                 transform hover:-translate-y-1"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Question Section */}
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full
                                              bg-indigo-50 text-indigo-600 font-semibold text-lg
                                              border-2 border-indigo-100">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-500 block mb-2">
                                        السؤال
                                    </label>
                                    <p className="text-gray-800 font-medium text-lg">{item.question}</p>
                                </div>
                            </div>

                            {/* Answer Section */}
                            <div className="flex items-center gap-3 ml-14">
                                <label className="text-sm font-medium text-gray-500">
                                    الإجابة:
                                </label>
                                <span
                                    className={`
                                        px-5 py-2 rounded-full text-sm font-medium 
                                        transition-all duration-300 ease-in-out
                                        hover:scale-105 cursor-default
                                        ${item.answer === "نعم"
                                        ? "bg-green-100 text-green-800 ring-1 ring-green-200 hover:bg-green-200"
                                        : "bg-red-100 text-red-800 ring-1 ring-red-200 hover:bg-red-200"
                                    }
                                    `}
                                >
                                    {item.answer}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {totalQuestions === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">لا توجد أسئلة</h3>
                    <p className="mt-1 text-gray-500">لم يتم إضافة أي أسئلة لهذا الاستبيان بعد</p>
                </div>
            )}
        </>
    );
};

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
                <div className="min-w-full inline-block align-middle max-w-[80vw] sm:max-w-full">
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
                                        <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                            العمر
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
                                                <DialogContent className="bg-gray-50">
                                                    <DialogTitle>تفاصيل التقييم</DialogTitle>
                                                    <div className="mt-2 border-t border-gray-300"/>
                                                     <SurveyDetails survey={survey}/>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">{member.age === 0 ? 'غير محدد' : member.age}</td>
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
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    <FileText className="text-blue-600"/>
                    {selectedClub.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-50 px-4 py-2 rounded-full">
            تم الإنشاء: {new Date(selectedClub.created).toLocaleDateString('ar-SA')}
          </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    icon={<Users/>}
                    label="عدد الأعضاء"
                    value={`${countMembers}/${selectedClub.max_members > 0 ? selectedClub.max_members : '∞'}`}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp/>}
                    label="معدل النشاط"
                    value="85%"
                    color="green"
                />
                <StatCard
                    icon={<Book/>}
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
              ${activeTab === tab.id
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'}
              transition-all duration-200 whitespace-nowrap font-medium
            `}
                    >
                        <tab.icon className="w-5 h-5"/>
                        {tab.label}
                    </button>
                ))}
            </div>

            {renderTable(activeTab)}
        </div>
    );
};

export default ClubStudentCard;
