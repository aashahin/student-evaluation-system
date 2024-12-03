import React from "react";
import { Book, Discussion, User } from "@/types/api";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { pb } from "@/lib/api";
import { toast } from "sonner";
import {
  BookAttendanceDialog,
  DeleteBookDialog,
} from "../dialogs/book-dialogs";
import BookEvaluationDetailsDialog from "../book-evaluation-details-dialog";

const BookTableHead = () => (
  <>
    <th
      scope="col"
      className="px-6 py-4 text-start text-sm font-semibold text-gray-900"
    >
      عنوان الكتاب
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      المؤلف
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      عدد الصفحات
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      تاريخ المناقشة
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      التقييمات
    </th>
    <th
      scope="col"
      className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
    >
      الإجراءات
    </th>
  </>
);

type BookTableRowProps = {
  books: Book[];
  fetchBooks: () => Promise<void>;
  onEdit: (book: Book) => void;
  clubMembers?: User[];
  clubId: string;
};

const BookTableRow = ({
  books,
  fetchBooks,
  onEdit,
  clubMembers,
  clubId,
}: BookTableRowProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const client = pb();

  // Filter students based on search query
  const filteredStudents = clubMembers?.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      await client.collection("books").delete(bookToDelete.id);
      toast.success("تم حذف الكتاب بنجاح");
      await fetchBooks();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الكتاب");
    }
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  const fetchAttendanceRecords = async (bookId: string) => {
    setLoading(true);
    try {
      const records = await client
        .collection("discussions")
        .getFullList<Discussion>({
          filter: `book_id = "${bookId}" && club_id = "${clubId}"`,
          expand: "student_id",
        });
      setAttendanceRecords(records);
    } catch (error) {
      toast.error("حدث خطأ أثناء استدعاء سجلات الحضور");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (studentId: string, bookId: string) => {
    try {
      const existingRecord = attendanceRecords.find(
        (record) =>
          record.student_id === studentId && record.book_id === bookId,
      );

      if (existingRecord) {
        await client.collection("discussions").update(existingRecord.id, {
          attended: !existingRecord.attended,
        });
      } else {
        await client.collection("discussions").create({
          student_id: studentId,
          book_id: bookId,
          club_id: clubId,
          discussion_date: selectedBook?.discussion_date,
          attended: true,
        });
      }

      await fetchAttendanceRecords(bookId);
      toast.success("تم تحديث الحضور بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الحضور");
    }
  };

  const isStudentAttended = (studentId: string) => {
    const record = attendanceRecords.find(
      (record) => record.student_id === studentId,
    );
    return record?.attended ?? false;
  };

  return (
    <>
      {books.map((book) => (
        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
          <td
            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 underline decoration-dotted underline-offset-4"
            onClick={() => {
              setSelectedBook(book);
              setAttendanceDialogOpen(true);
              fetchAttendanceRecords(book.id);
            }}
          >
            {book.title}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
            {book.author || "غير محدد"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
            {book.page_count || "غير محدد"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
            {new Date(book.discussion_date).toLocaleDateString("ar")}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-800">
            <BookEvaluationDetailsDialog book={book} />
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
            <div className="flex justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(book)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBookToDelete(book);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))}

      {/* Attendance Dialog */}
      <BookAttendanceDialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
        selectedBook={selectedBook}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchQuery(query)}
        filteredStudents={filteredStudents}
        attendanceRecords={attendanceRecords}
        clubMembers={clubMembers}
        onToggleAttendance={toggleAttendance}
        isStudentAttended={isStudentAttended}
      />

      {/* Delete Dialog */}
      <DeleteBookDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};

export { BookTableHead, BookTableRow };
