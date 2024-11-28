"use client";

import { Calendar, FileText } from "lucide-react";
import React from "react";

const UpcomingDiscussions = () => {
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Calendar className="text-green-600" />
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
                  <Calendar className="w-4 h-4" />
                  {discussion.date}
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDiscussions;
