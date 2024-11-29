"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Award,
  BookIcon,
  FileText,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import { Book, ReadingBook, ReadingClub, Survey, User } from "@/types/api";
import ClubStudentTable from "@/components/dashboard/teacher/_components/club-student-table";
import PocketBase from "pocketbase";
import { toast } from "sonner";
import { calculateClubStats } from "@/stats/teacher";
import ClubSettings from "@/components/dashboard/_components/club-settings";
import CreateBookDialog from "@/components/dashboard/teacher/_components/create-book";
import EditBookDialog from "@/components/dashboard/teacher/_components/edit-book";

type ClubStudentCardProps = {
  selectedClub: ReadingClub;
  surveys: Survey[];
  isLoadingSurveys: boolean;
  clubMembers: User[];
  client: PocketBase;
  fetchClubs: () => Promise<void>;
  onBack?: () => void;
};

const TABS = [
  { id: "books", label: "الكتب", icon: BookIcon },
  { id: "surveys", label: "التقييمات", icon: Award },
  { id: "members", label: "الأعضاء", icon: Users },
];

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
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

const ClubStudentCard = ({
  selectedClub,
  surveys,
  isLoadingSurveys,
  clubMembers,
  client,
  fetchClubs,
  onBack,
}: ClubStudentCardProps) => {
  const [activeTab, setActiveTab] = useState("books");
  const [readBooks, setReadBooks] = useState<ReadingBook[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchReadBooks = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const booksData = await client
        .collection("reading_books")
        .getFullList<ReadingBook>({
          filter: `club_id = "${selectedClub.id}" && is_read = true`,
          requestKey: Math.random().toString(),
        });
      setReadBooks(booksData);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحصول على الكتب المقروءة للمجموعة");
    } finally {
      setIsLoadingBooks(false);
    }
  }, [client, selectedClub]);

  const fetchBooks = useCallback(async () => {
    try {
      const booksData = await client.collection("books").getFullList<Book>({
        filter: `club_id = "${selectedClub.id}"`,
        sort: "-created",
        requestKey: Math.random().toString(),
      });
      setBooks(booksData);
    } catch (error) {
      toast.error("حدث خطأ أثناء الحصول على الكتب المقروءة للمجموعة");
    }
  }, [client, selectedClub]);

  useEffect(() => {
    if (selectedClub) {
      fetchReadBooks();
      fetchBooks();
    }
  }, [fetchBooks, fetchReadBooks, selectedClub]);

  const stats = calculateClubStats(
    surveys,
    clubMembers || [],
    selectedClub.max_members,
    readBooks,
  );

  const handleEditBook = (book: Book) => {
    setBookToEdit(book);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-8 overflow-x-auto">
      {/* Back button for mobile */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden mb-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowRight className="w-5 h-5 ml-1" />
          العودة للنوادي
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-x-3">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <FileText className="text-blue-600" />
            {selectedClub.name}
          </h2>
          <ClubSettings
            club={selectedClub}
            client={client}
            onClubUpdated={fetchClubs}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-50 px-4 py-2 rounded-full">
            تم الإنشاء:{" "}
            {new Date(selectedClub.created).toLocaleDateString("ar-SA")}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Users />}
          label="عدد الأعضاء"
          value={`${stats.memberCount}/${stats.maxMembers ?? "∞"}`}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp />}
          label="معدل النشاط"
          value={`${stats.activityRate}%`}
          color="green"
        />
        <StatCard
          icon={<BookIcon />}
          label="الكتب المقروءة"
          value={`${stats.readBooksCount}`}
          color="purple"
        />
      </div>

      <div className="flex gap-4 border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 
              ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }
              transition-all duration-200 whitespace-nowrap font-medium
            `}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "books" && (
        <CreateBookDialog clubId={selectedClub.id} fetchBooks={fetchBooks} />
      )}

      <ClubStudentTable
        activeTab={activeTab}
        surveys={surveys}
        clubMembers={clubMembers}
        isLoadingSurveys={isLoadingSurveys}
        clubId={selectedClub.id}
        client={client}
        fetchClubs={fetchClubs}
        books={books}
        isLoadingBooks={isLoadingBooks}
        fetchBooks={fetchBooks}
        onEditBook={handleEditBook}
      />
      {bookToEdit !== null && (
        <EditBookDialog
          book={bookToEdit}
          fetchBooks={fetchBooks}
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
        />
      )}
    </div>
  );
};

export default ClubStudentCard;
