"use client";

import {Award, Book, Clock, FileText, Loader, Plus, Search, Star, TrendingUp, Users} from "lucide-react";
import React, {useEffect, useState} from "react";
import {ReadingClub, StudentEvaluation} from "@/types/api";
import {pb} from "@/lib/api";
import {Button} from "@/components/ui/button";

export default function Clubs() {
    const [readingClubs, setReadingClubs] = useState<ReadingClub[]>([]);
    const [selectedClub, setSelectedClub] = useState<ReadingClub | null>(null);
    const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const client = pb();

    useEffect(() => {
        fetchClubs().then(() => setIsLoading(false));
    }, []);

    const fetchClubs = async () => {
        setIsLoading(true);
        try {
            const records = await client.collection('reading_clubs').getFullList<ReadingClub>({
                sort: '-created',
                requestKey: Math.random().toString(),
                expand: 'grade_level',
            });
            console.log(...records);
            setReadingClubs(records);
        } catch (error) {
            console.error('Error fetching reading clubs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClubEvaluations = async (clubId: string) => {
        setIsLoadingEvaluations(true);
        try {
            const records = await client.collection('self_evaluations').getFullList<StudentEvaluation>({
                filter: `club_id = "${clubId}"`,
                expand: 'student_id,book_id',
            });
            setEvaluations(records);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setIsLoadingEvaluations(false);
        }
    };

    const handleClubSelect = (club: ReadingClub) => {
        setSelectedClub(club);
        fetchClubEvaluations(club.id).then(() => setIsLoadingEvaluations(false));
    };

    const filteredClubs = readingClubs.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Reading Clubs Section */}
            <div className="bg-white shadow rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Book className="text-blue-600"/>
                        نوادي القراءة
                    </h2>
                    <Button>
                        <Plus size={18}/>
                        إنشاء نادي جديد
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="البحث في النوادي..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <Loader className="animate-spin text-blue-600"/>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {filteredClubs.map((club) => (
                            <div
                                key={club.id}
                                onClick={() => handleClubSelect(club)}
                                className={`border p-5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow ${
                                    selectedClub?.id === club.id
                                        ? "border-blue-500 bg-blue-50 shadow"
                                        : "border-gray-200 hover:border-blue-300"
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">{club.name}</h3>
                                        <div className="flex items-center gap-4">
                            <span className="flex items-center text-sm text-gray-600">
                              <Users className="inline-block ml-1 w-4 h-4"/>
                                {club.max_members} عضو
                            </span>
                                            <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                              {club.expand?.grade_level?.name}
                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Club Details Section */}
            {selectedClub ? (
                <div className="bg-white shadow rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FileText className="text-blue-600"/>
                        تفاصيل النادي: {selectedClub.name}
                    </h2>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="text-blue-600"/>
                                <p className="text-sm text-gray-600">عدد الأعضاء</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {selectedClub.max_members}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="text-green-600"/>
                                <p className="text-sm text-gray-600">معدل النشاط</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">85%</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Book className="text-purple-600"/>
                                <p className="text-sm text-gray-600">الكتب المقروءة</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">12</p>
                        </div>
                    </div>

                    {/* Evaluations Table */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Award className="text-blue-600"/>
                            تقييمات الطلاب
                        </h3>
                        {isLoadingEvaluations ? (
                            <div className="flex justify-center items-center p-8">
                                <Loader className="animate-spin text-blue-600"/>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-100 rounded-lg">
                                        <th className="p-3 text-right">اسم الطالب</th>
                                        <th className="p-3 text-center">مستوى المشاركة</th>
                                        <th className="p-3 text-center">مستوى الفهم</th>
                                        <th className="p-3 text-center">سرعة القراءة</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {evaluations.map((evaluation) => (
                                        <tr key={evaluation.id} className="border-b border-gray-200">
                                            <td className="p-3">
                                                {evaluation.expand?.student_id?.name || 'Unknown Student'}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Star className="text-yellow-500 me-1"/>
                                                    {evaluation.engagement_level === "high"
                                                        ? "مرتفع"
                                                        : evaluation.engagement_level === "medium"
                                                            ? "متوسط"
                                                            : "منخفض"}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                <span
                                    className={`
                                    px-3 py-1 rounded-full text-sm
                                    ${
                                        evaluation.comprehension_level === "high"
                                            ? "bg-green-100 text-green-800"
                                            : evaluation.comprehension_level === "medium"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                    }
                                  `}
                                >
                                  {evaluation.comprehension_level === "high"
                                      ? "مرتفع"
                                      : evaluation.comprehension_level === "medium"
                                          ? "متوسط"
                                          : "منخفض"}
                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center">
                                                    <Clock className="text-blue-500 me-1"/>
                                                    {evaluation.reading_speed === "slow"
                                                        ? "سريع"
                                                        : evaluation.reading_speed === "medium"
                                                            ? "متوسط"
                                                            : "بطيء"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-xl p-6 flex items-center justify-center text-gray-500">
                    اختر ناديًا لعرض التفاصيل
                </div>
            )}
        </div>
    )
}