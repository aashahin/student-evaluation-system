"use client";

import React, { useEffect, useState } from "react";
import { Book, Survey, User } from "@/types/api";
import { Loader } from "lucide-react";
import PocketBase from "pocketbase";
import { toast } from "sonner";
import {
  SurveyTableHead,
  SurveyTableRow,
} from "@/components/dashboard/teacher/_components/table/surveys";
import {
  BookTableHead,
  BookTableRow,
} from "@/components/dashboard/teacher/_components/table/books";
import {
  MemberTableHead,
  MemberTableRow,
} from "@/components/dashboard/teacher/_components/table/members";

type ClubStudentTableProps = {
  surveys: Survey[];
  isLoadingSurveys: boolean;
  activeTab: string;
  clubMembers: User[];
  clubId: string;
  client: PocketBase;
  fetchClubs: () => Promise<void>;
  books: Book[];
  isLoadingBooks: boolean;
  onEditBook: (book: Book) => void;
  fetchBooks: () => Promise<void>;
};

const ClubStudentTable = ({
  activeTab,
  surveys,
  clubMembers,
  isLoadingSurveys,
  clubId,
  client,
  fetchClubs,
  books,
  isLoadingBooks,
  onEditBook,
  fetchBooks,
}: ClubStudentTableProps) => {
  const [openSurveyDetails, setOpenSurveyDetails] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [memberSurveys, setMemberSurveys] = useState<Record<string, Survey[]>>(
    {},
  );
  const [openTeacherSurveys, setOpenTeacherSurveys] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  useEffect(() => {
    const fetchMemberSurveys = async () => {
      try {
        const surveysMap: Record<string, Survey[]> = {};

        for (const member of clubMembers) {
          surveysMap[member.id] = await client
            .collection("surveys")
            .getFullList({
              filter: `club_id = "${clubId}" && student_id = "${member.id}"`,
              sort: "-created",
              requestKey: Math.random().toString(),
              expand: "student_id",
            });
        }

        setMemberSurveys(surveysMap);
      } catch (error) {
        toast.error("حدث خطأ ما أثناء إستدعاء إستبيانات الطلاب");
      }
    };

    if (activeTab === "members" && clubMembers.length > 0) {
      fetchMemberSurveys();
    }
  }, [activeTab, clubMembers, clubId, client]);

  if (
    (activeTab === "surveys" && isLoadingSurveys) ||
    (activeTab === "books" && isLoadingBooks)
  ) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <div className="min-w-full inline-block align-middle max-w-[80vw]">
        <div className="scrollarea">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === "surveys" ? (
                  <SurveyTableHead />
                ) : activeTab === "books" ? (
                  <BookTableHead />
                ) : (
                  <MemberTableHead />
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === "surveys" ? (
                SurveyTableRow({
                  surveys,
                  selectedSurvey,
                  setSelectedSurvey,
                  openSurveyDetails,
                  setOpenSurveyDetails,
                })
              ) : activeTab === "books" ? (
                <BookTableRow
                  books={books}
                  fetchBooks={fetchBooks}
                  onEdit={onEditBook}
                />
              ) : (
                <MemberTableRow
                  members={clubMembers}
                  selectedMember={selectedMember}
                  setSelectedMember={setSelectedMember}
                  openTeacherSurveys={openTeacherSurveys}
                  setOpenTeacherSurveys={setOpenTeacherSurveys}
                  memberSurveys={memberSurveys}
                  clubId={clubId}
                  fetchClubs={fetchClubs}
                />
              )}
            </tbody>
          </table>

          {activeTab === "members" && clubMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا يوجد أعضاء في النادي حالياً
            </div>
          )}
          {activeTab === "surveys" && surveys.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد تقييمات حالياً
            </div>
          )}
          {activeTab === "books" && books.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا توجد كتب حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubStudentTable;
