"use client";

import {BarChart2, Calendar, FileText} from "lucide-react";
import React from "react";

export default function Reports() {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Monthly Performance Report */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <BarChart2 className="text-blue-600"/>
                    التقرير الشهري
                </h2>
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="font-bold mb-4">مؤشرات الأداء</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600 mb-2">عدد الكتب</p>
                                <p className="text-2xl font-bold text-blue-600">12</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600 mb-2">متوسط التقييم</p>
                                <p className="text-2xl font-bold text-green-600">4.3</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600 mb-2">نسبة المشاركة</p>
                                <p className="text-2xl font-bold text-purple-600">85%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Discussions */}
            <div className="bg-white shadow rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="text-green-600"/>
                    المناقشات القادمة
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            title: "رحلة في عالم العلوم",
                            date: "15 يونيو 2024",
                        },
                        {
                            title: "أسرار الكون",
                            date: "22 يونيو 2024",
                        },
                    ].map((discussion, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-xl hover:shadow transition-shadow"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{discussion.title}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4"/>
                                        {discussion.date}
                                    </p>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700">
                                    <FileText className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}