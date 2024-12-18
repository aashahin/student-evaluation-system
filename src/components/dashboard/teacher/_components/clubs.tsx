"use client";

import React, { useCallback, useEffect, useState } from "react";
import { GradeLevel, ReadingClub, Survey, User } from "@/types/api";
import { pb } from "@/lib/api";
import dynamic from "next/dynamic";
import ClubsSection from "@/components/dashboard/teacher/_components/clubs-section";
import { toast } from "sonner";

const ClubStudentCard = dynamic(
  () => import("@/components/dashboard/teacher/_components/club-student-card"),
  {
    ssr: false,
  },
);

export default function Clubs() {
  const [readingClubs, setReadingClubs] = useState<ReadingClub[]>([]);
  const [selectedClub, setSelectedClub] = useState<ReadingClub | null>(null);
  const [evaluations, setEvaluations] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [clubMemberCounts, setClubMemberCounts] = useState<
    Record<string, number>
  >({});
  const [clubMembers, setClubMembers] = useState<Record<string, User[]>>({});
  const client = pb();

  const fetchClubMemberCounts = useCallback(
    async (clubIds: string[]) => {
      try {
        const counts: Record<string, number> = {};
        for (const clubId of clubIds) {
          const records = await client.collection("users").getFullList<User>({
            filter: `club_id = "${clubId}"`,
            requestKey: Math.random().toString(),
          });
          counts[clubId] = records.length;
          setClubMembers((prevClubMembers) => ({
            ...prevClubMembers,
            [clubId]: records.map((item) => item),
          }));
        }
        setClubMemberCounts(counts);
      } catch (error) {
        toast.error("حدث خطأ ما أثناء إستدعاء الأعضاء");
      }
    },
    [client],
  );

  const fetchGradeLevels = useCallback(async () => {
    try {
      const records = await client
        .collection("grade_levels")
        .getFullList<GradeLevel>({
          requestKey: Math.random().toString(),
        });
      setGradeLevels(records);
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إستدعاء المراحل");
    }
  }, [client]);

  const fetchClubs = useCallback(async () => {
    setIsLoading(true);
    try {
      const teacherId = client.authStore.record?.id;
      const records = await client
        .collection("reading_clubs")
        .getFullList<ReadingClub>({
          filter: `teacher_id = '${teacherId}'`,
          sort: "-created",
          requestKey: Math.random().toString(),
          expand: "grade_level",
        });
      setReadingClubs(records);
      await fetchClubMemberCounts(records.map((club) => club.id));
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إستدعاء النوادي");
    } finally {
      setIsLoading(false);
    }
  }, [client, fetchClubMemberCounts]);

  useEffect(() => {
    fetchClubs().then(() => fetchGradeLevels());
  }, [fetchClubs, fetchGradeLevels]);

  const fetchClubEvaluations = async (clubId: string) => {
    setIsLoadingEvaluations(true);
    try {
      const records = await client.collection("surveys").getFullList<Survey>({
        filter: `club_id = "${clubId}"`,
        expand: "student_id",
        sort: "-created",
        requestKey: Math.random().toString(),
      });
      setEvaluations(records);
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إستدعاء الإستبيانات");
    } finally {
      setIsLoadingEvaluations(false);
    }
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        {selectedClub ? (
          <ClubStudentCard
            selectedClub={selectedClub}
            surveys={evaluations}
            isLoadingSurveys={isLoadingEvaluations}
            clubMembers={clubMembers[selectedClub.id]}
            client={client}
            fetchClubs={fetchClubs}
            onBack={() => setSelectedClub(null)}
          />
        ) : (
          <ClubsSection
            readingClubs={readingClubs}
            setSelectedClub={setSelectedClub}
            gradeLevels={gradeLevels}
            fetchClubs={fetchClubs}
            setIsLoadingEvaluations={setIsLoadingEvaluations}
            client={client}
            isLoading={isLoading}
            clubMemberCounts={clubMemberCounts}
            selectedClub={selectedClub}
            fetchClubEvaluations={fetchClubEvaluations}
          />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        <ClubsSection
          readingClubs={readingClubs}
          setSelectedClub={setSelectedClub}
          gradeLevels={gradeLevels}
          fetchClubs={fetchClubs}
          setIsLoadingEvaluations={setIsLoadingEvaluations}
          client={client}
          isLoading={isLoading}
          clubMemberCounts={clubMemberCounts}
          selectedClub={selectedClub}
          fetchClubEvaluations={fetchClubEvaluations}
        />

        {selectedClub ? (
          <ClubStudentCard
            selectedClub={selectedClub}
            surveys={evaluations}
            isLoadingSurveys={isLoadingEvaluations}
            clubMembers={clubMembers[selectedClub.id]}
            client={client}
            fetchClubs={fetchClubs}
          />
        ) : (
          <div className="bg-white shadow rounded-xl p-6 flex items-center justify-center text-gray-500">
            اختر ناديًا لعرض التفاصيل
          </div>
        )}
      </div>
    </>
  );
}
