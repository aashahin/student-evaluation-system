import React from "react";

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

export default Evaluations;
