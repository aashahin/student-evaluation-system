"use client";

import { Calendar, FileText, AlertCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { pb } from "@/lib/api";
import { Book } from "@/types/api";

const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted p-4 text-sm font-medium text-foreground ${className}`}
    >
      <div className="h-4 w-full rounded-md bg-muted" />
    </div>
  );
};

const UpcomingDiscussions = () => {
  const [discussions, setDiscussions] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const client = pb();

  const fetchUpcomingDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const teacherId = client.authStore.record?.id;
      if (!teacherId) {
        setError("لم يتم العثور على معرف المعلم");
        setLoading(false);
        return;
      }

      const records = await client.collection("books").getFullList<Book>({
        sort: "-created",
        filter: `discussion_date >= @now && teacher_id = "${teacherId}"`,
        requestKey: Math.random().toString(),
      });

      setDiscussions(records);
    } catch (error) {
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchUpcomingDiscussions();
  }, [fetchUpcomingDiscussions]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const DiscussionSkeleton = () => (
    <div className="animate-pulse">
      <div className="p-4 border border-gray-200 rounded-xl space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Calendar className="text-green-600" />
        المناقشات القادمة
      </h2>

      {error && (
        <div className="mb-4 flex items-center gap-x-2 border border-gray-200 p-6 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      <div className="space-y-4 scrollarea" style={{ maxHeight: "650px" }}>
        {loading ? (
          <>
            <DiscussionSkeleton />
            <DiscussionSkeleton />
            <DiscussionSkeleton />
          </>
        ) : discussions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>لا توجد مناقشات قادمة</p>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors duration-200"
            >
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {discussion.title ?? "غير متوفر"}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(discussion.discussion_date)}
                </p>
              </div>
              <button
                className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
                aria-label="عرض التفاصيل"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {!loading && discussions.length > 0 && (
        <button
          onClick={() => fetchUpcomingDiscussions()}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          تحديث المناقشات
        </button>
      )}
    </div>
  );
};

export default UpcomingDiscussions;
